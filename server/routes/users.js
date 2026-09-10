const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Search users — MUST be before /:username to avoid being caught by wildcard
router.get('/search/all', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);
        
        const result = await db.query(
            'SELECT id, username FROM users WHERE username ILIKE $1 LIMIT 10',
            [`%${q}%`]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error searching users' });
    }
});

// Get personalized social feed — MUST be before /:username
router.get('/feed/activity', auth, async (req, res) => {
    try {
        const query = `
            SELECT 
                ug.id, ug.status, ug.rating, ug.review, 
                COALESCE(ug.updated_at, ug.added_at) as activity_date,
                u.username, u.id as user_id,
                g.title as game_title, g.cover_url as game_cover, g.rawg_id as game_id
            FROM user_games ug
            JOIN users u ON ug.user_id = u.id
            JOIN games g ON ug.game_id = g.id
            JOIN follows f ON f.followed_id = u.id
            WHERE f.follower_id = $1
            ORDER BY COALESCE(ug.updated_at, ug.added_at) DESC
            LIMIT 50
        `;
        const result = await db.query(query, [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching feed' });
    }
});

// Get user profile by username
router.get('/:username', async (req, res) => {
    try {
        const result = await db.query('SELECT id, username, created_at FROM users WHERE username = $1', [req.params.username]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
        
        const user = result.rows[0];

        // Get followers/following count
        const followers = await db.query('SELECT COUNT(*) FROM follows WHERE followed_id = $1', [user.id]);
        const following = await db.query('SELECT COUNT(*) FROM follows WHERE follower_id = $1', [user.id]);
        
        res.json({
            ...user,
            followers_count: parseInt(followers.rows[0].count),
            following_count: parseInt(following.rows[0].count)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Follow a user
router.post('/:id/follow', auth, async (req, res) => {
    try {
        if (req.user.id === parseInt(req.params.id)) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }
        await db.query(
            'INSERT INTO follows (follower_id, followed_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [req.user.id, req.params.id]
        );
        res.json({ message: 'Successfully followed user' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Unfollow a user
router.post('/:id/unfollow', auth, async (req, res) => {
    try {
        await db.query(
            'DELETE FROM follows WHERE follower_id = $1 AND followed_id = $2',
            [req.user.id, req.params.id]
        );
        res.json({ message: 'Successfully unfollowed user' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Check if following
router.get('/:id/is-following', auth, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT 1 FROM follows WHERE follower_id = $1 AND followed_id = $2',
            [req.user.id, req.params.id]
        );
        res.json({ isFollowing: result.rows.length > 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
