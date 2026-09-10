const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Get user's library
router.get('/', auth, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT ug.id as tracking_id, ug.status, ug.rating, ug.review, ug.added_at,
                   g.id as game_id, g.rawg_id, g.title, g.cover_url, g.release_date, g.rawg_rating
            FROM user_games ug
            JOIN games g ON ug.game_id = g.id
            WHERE ug.user_id = $1
            ORDER BY ug.added_at DESC
        `, [req.user.id]);
        
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch library' });
    }
});

// Add game to library
router.post('/', auth, async (req, res) => {
    try {
        const { rawg_id, status } = req.body;
        
        // 1. Find internal game_id from games table
        const gameResult = await db.query('SELECT id FROM games WHERE rawg_id = $1', [rawg_id]);
        if (gameResult.rows.length === 0) {
            return res.status(404).json({ message: 'Game not found in database. Please view details first.' });
        }
        const game_id = gameResult.rows[0].id;

        // 2. Insert into user_games
        const insertResult = await db.query(
            'INSERT INTO user_games (user_id, game_id, status) VALUES ($1, $2, $3) RETURNING *',
            [req.user.id, game_id, status || 'want_to_play']
        );
        
        res.json(insertResult.rows[0]);
    } catch (err) {
        if (err.code === '23505') { // unique_violation
            return res.status(400).json({ message: 'Game is already in your library' });
        }
        console.error(err);
        res.status(500).json({ message: 'Failed to add game to library' });
    }
});

// Update library entry (status, rating, review)
router.put('/:id', auth, async (req, res) => {
    try {
        const { status, rating, review } = req.body;
        const trackingId = req.params.id;

        // Ensure user owns this tracking entry
        const checkResult = await db.query('SELECT user_id FROM user_games WHERE id = $1', [trackingId]);
        if (checkResult.rows.length === 0) return res.status(404).json({ message: 'Entry not found' });
        if (checkResult.rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

        const updateResult = await db.query(
            `UPDATE user_games 
             SET status = COALESCE($1, status), 
                 rating = COALESCE($2, rating), 
                 review = COALESCE($3, review),
                 updated_at = NOW()
             WHERE id = $4 RETURNING *`,
            [status, rating, review, trackingId]
        );

        res.json(updateResult.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update library entry' });
    }
});

// Remove from library
router.delete('/:id', auth, async (req, res) => {
    try {
        const trackingId = req.params.id;
        
        const checkResult = await db.query('SELECT user_id FROM user_games WHERE id = $1', [trackingId]);
        if (checkResult.rows.length === 0) return res.status(404).json({ message: 'Entry not found' });
        if (checkResult.rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

        await db.query('DELETE FROM user_games WHERE id = $1', [trackingId]);
        res.json({ message: 'Game removed from library' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to remove game from library' });
    }
});

module.exports = router;
