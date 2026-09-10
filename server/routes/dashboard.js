const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Basic counts
        const statsResult = await db.query(`
            SELECT 
                COUNT(*) as total_tracked,
                COUNT(*) FILTER (WHERE status = 'completed') as completed,
                COUNT(*) FILTER (WHERE status = 'playing') as playing,
                COUNT(*) FILTER (WHERE status = 'dropped') as dropped,
                COUNT(*) FILTER (WHERE status = 'want_to_play') as want_to_play,
                AVG(rating) as avg_rating
            FROM user_games 
            WHERE user_id = $1
        `, [userId]);

        const stats = statsResult.rows[0];

        // 2. Top Genres
        const genresResult = await db.query(`
            SELECT genre, COUNT(*) as count
            FROM user_games ug
            JOIN games g ON ug.game_id = g.id,
            UNNEST(g.genres) as genre
            WHERE ug.user_id = $1
            GROUP BY genre
            ORDER BY count DESC
            LIMIT 5
        `, [userId]);

        // 3. Recently Added Games (last 5)
        const recentResult = await db.query(`
            SELECT ug.id as tracking_id, ug.status, ug.rating, ug.added_at,
                   g.id as game_id, g.rawg_id, g.title, g.cover_url
            FROM user_games ug
            JOIN games g ON ug.game_id = g.id
            WHERE ug.user_id = $1
            ORDER BY ug.added_at DESC
            LIMIT 5
        `, [userId]);

        res.json({
            stats: {
                totalTracked: parseInt(stats.total_tracked) || 0,
                completed: parseInt(stats.completed) || 0,
                playing: parseInt(stats.playing) || 0,
                dropped: parseInt(stats.dropped) || 0,
                wantToPlay: parseInt(stats.want_to_play) || 0,
                avgRating: stats.avg_rating ? parseFloat(stats.avg_rating).toFixed(1) : null
            },
            topGenres: genresResult.rows,
            recentGames: recentResult.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to load dashboard stats' });
    }
});

module.exports = router;
