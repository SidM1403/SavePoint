const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Create a new list
router.post('/', auth, async (req, res) => {
    try {
        const { name, description, is_private } = req.body;
        if (!name) return res.status(400).json({ message: 'List name is required' });

        const result = await db.query(
            'INSERT INTO lists (user_id, name, description, is_private) VALUES ($1, $2, $3, $4) RETURNING *',
            [req.user.id, name, description, is_private || false]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's lists
router.get('/user/:userId', async (req, res) => {
    try {
        // If it's not the owner requesting, only show public lists
        // Since we don't know who is requesting here easily without auth middleware on GET,
        // we'll pass an optional ?owner=true or handle it via a separate /my-lists route.
        // For simplicity, let's just use /my-lists for authenticated user.
        const result = await db.query('SELECT * FROM lists WHERE user_id = $1 AND is_private = false ORDER BY created_at DESC', [req.params.userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get my lists (includes private)
router.get('/my-lists', auth, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM lists WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get specific list and its games
router.get('/:id', async (req, res) => {
    try {
        const listResult = await db.query('SELECT * FROM lists WHERE id = $1', [req.params.id]);
        if (listResult.rows.length === 0) return res.status(404).json({ message: 'List not found' });
        
        const list = listResult.rows[0];

        const gamesResult = await db.query(`
            SELECT g.*, le.added_at, le.id as entry_id
            FROM list_entries le
            JOIN games g ON le.game_id = g.id
            WHERE le.list_id = $1
            ORDER BY le.added_at DESC
        `, [list.id]);

        res.json({
            ...list,
            games: gamesResult.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add game to list
router.post('/:id/games', auth, async (req, res) => {
    try {
        const { game_id } = req.body;
        
        // Check ownership
        const listRes = await db.query('SELECT user_id FROM lists WHERE id = $1', [req.params.id]);
        if (listRes.rows.length === 0) return res.status(404).json({ message: 'List not found' });
        if (listRes.rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

        await db.query(
            'INSERT INTO list_entries (list_id, game_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [req.params.id, game_id]
        );
        res.json({ message: 'Game added to list' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Remove game from list
router.delete('/:id/games/:gameId', auth, async (req, res) => {
    try {
        // Check ownership
        const listRes = await db.query('SELECT user_id FROM lists WHERE id = $1', [req.params.id]);
        if (listRes.rows.length === 0) return res.status(404).json({ message: 'List not found' });
        if (listRes.rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

        await db.query(
            'DELETE FROM list_entries WHERE list_id = $1 AND game_id = $2',
            [req.params.id, req.params.gameId]
        );
        res.json({ message: 'Game removed from list' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
