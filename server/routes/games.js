const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../db');
const redisClient = require('../redis');
const auth = require('../middleware/auth');

// Twitch Token Management
let twitchToken = null;
let tokenExpiry = null;

async function getTwitchToken() {
    if (twitchToken && tokenExpiry && Date.now() < tokenExpiry) {
        return twitchToken;
    }
    
    try {
        const res = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`);
        
        if (typeof res.data === 'string' && res.data.includes('<html')) {
            throw new Error('Firewall or Captive Portal intercepted the request. Please authenticate in your browser.');
        }

        if (!res.data || !res.data.access_token) {
            throw new Error('Invalid response from Twitch API');
        }

        twitchToken = res.data.access_token;
        // Token expires in X seconds, subtract 5 mins (300000 ms) for safety
        tokenExpiry = Date.now() + (res.data.expires_in * 1000) - 300000;
        return twitchToken;
    } catch (err) {
        console.error('Failed to get Twitch token', err.response?.data || err.message);
        throw new Error('Twitch auth failed: ' + err.message);
    }
}

// Landing page lists
router.get('/landing', async (req, res) => {
    try {
        const cacheKey = `landing:lists`;
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            return res.json(JSON.parse(cached));
        }

        const token = await getTwitchToken();
        const now = Math.floor(Date.now() / 1000);
        const sixMonthsAgo = now - (180 * 24 * 60 * 60);

        const query = `
            query games "popular" {
                fields name, cover.image_id, first_release_date, artworks.image_id;
                where cover != null & total_rating_count > 300;
                sort total_rating_count desc;
                limit 14;
            };
            query games "newReleases" {
                fields name, cover.image_id, first_release_date;
                where first_release_date < ${now} & first_release_date > ${sixMonthsAgo} & cover != null;
                sort first_release_date desc;
                limit 14;
            };
            query games "highlyRated" {
                fields name, cover.image_id, first_release_date, total_rating;
                where total_rating_count > 50 & cover != null;
                sort total_rating desc;
                limit 14;
            };
        `;

        const response = await axios.post('https://api.igdb.com/v4/multiquery', query, {
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        const formattedResults = {};
        response.data.forEach(result => {
            formattedResults[result.name] = result.result.map(game => ({
                id: game.id,
                title: game.name,
                cover_url: game.cover?.image_id ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg` : 'https://via.placeholder.com/200x300?text=No+Cover',
                background_url: game.artworks && game.artworks.length > 0 ? `https://images.igdb.com/igdb/image/upload/t_1080p/${game.artworks[0].image_id}.jpg` : null,
                release_date: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString().split('T')[0] : 'N/A'
            }));
        });

        await redisClient.set(cacheKey, JSON.stringify(formattedResults), { EX: 3600 });
        res.json(formattedResults);
    } catch (err) {
        console.error('Landing endpoint error:', err.response?.data || err.message);
        res.status(500).json({ message: 'Failed to fetch landing games' });
    }
});

// Search games using IGDB
router.get('/search', async (req, res) => {
    try {
        const { q, genres, sort } = req.query;
        if (!q && !genres) return res.json([]);

        // Cache Check
        const cacheKey = `search:${q || 'all'}:${genres || 'all'}:${sort || 'relevance'}`;
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            return res.json(JSON.parse(cached));
        }

        const token = await getTwitchToken();
        
        let searchString = q ? `search "${q}";` : '';
        let whereString = genres ? `where genres = (${genres});` : '';
        
        let sortString = '';
        if (sort === 'trending') {
            sortString = 'sort follows desc;';
        } else if (sort === 'rating') {
            sortString = 'sort total_rating desc;';
            if (!whereString) whereString = 'where total_rating_count > 50;';
            else whereString = `where genres = (${genres}) & total_rating_count > 50;`;
        } else if (sort === 'newest') {
            sortString = 'sort first_release_date desc;';
        }

        // IGDB Apicalypse query
        const query = `
            ${searchString}
            ${whereString}
            fields name, cover.image_id, first_release_date, total_rating, genres.name;
            ${sortString}
            limit 24;
        `;

        const response = await axios.post('https://api.igdb.com/v4/games', query, {
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        // Map IGDB format to the expected frontend format
        const formattedResults = response.data.map(game => {
            return {
                id: game.id,
                title: game.name,
                cover_url: game.cover?.image_id ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg` : 'https://via.placeholder.com/200x300?text=No+Cover',
                release_date: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString().split('T')[0] : 'N/A',
                rawg_rating: game.total_rating ? parseFloat((game.total_rating / 10).toFixed(1)) : null, // Convert 100-scale to 10-scale
                genres: game.genres ? game.genres.map(g => g.name) : []
            };
        });

        await redisClient.set(cacheKey, JSON.stringify(formattedResults), { EX: 3600 });
        res.json(formattedResults);
    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).json({ message: 'Failed to fetch games from IGDB' });
    }
});

// Get community reviews for a game
router.get('/:rawgId/reviews', async (req, res) => {
    try {
        const { rawgId } = req.params;
        
        // Find internal game_id
        const gameResult = await db.query('SELECT id FROM games WHERE rawg_id = $1', [rawgId]);
        if (gameResult.rows.length === 0) {
            return res.json([]); // Game not tracked yet, so no reviews
        }
        const game_id = gameResult.rows[0].id;

        // Get reviews
        const reviewsResult = await db.query(`
            SELECT ug.rating, ug.review, ug.updated_at, ug.added_at, u.username
            FROM user_games ug
            JOIN users u ON ug.user_id = u.id
            WHERE ug.game_id = $1 AND ug.review IS NOT NULL AND ug.review != ''
            ORDER BY COALESCE(ug.updated_at, ug.added_at) DESC
        `, [game_id]);

        res.json(reviewsResult.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch reviews' });
    }
});

// Get recent community activity feed
router.get('/activity', async (req, res) => {
    try {
        const activityResult = await db.query(`
            SELECT ug.rating, ug.review, ug.status, ug.updated_at, ug.added_at, 
                   u.username, g.title as game_title, g.cover_url as game_cover, g.rawg_id as game_id
            FROM user_games ug
            JOIN users u ON ug.user_id = u.id
            JOIN games g ON ug.game_id = g.id
            WHERE ug.review IS NOT NULL OR ug.rating IS NOT NULL OR ug.status != 'plan_to_play'
            ORDER BY COALESCE(ug.updated_at, ug.added_at) DESC
            LIMIT 10
        `);
        res.json(activityResult.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch activity feed' });
    }
});

// Get personalized recommendations based on highest rated game
router.get('/recommended', auth, async (req, res) => {
    try {
        // Find user's highest rated game
        const topGameResult = await db.query(`
            SELECT g.rawg_id as igdb_id, g.title
            FROM user_games ug
            JOIN games g ON ug.game_id = g.id
            WHERE ug.user_id = $1 AND ug.rating IS NOT NULL
            ORDER BY ug.rating DESC, ug.added_at DESC
            LIMIT 1
        `, [req.user.id]);

        if (topGameResult.rows.length === 0) {
            return res.json({ message: 'No ratings found to base recommendations on.', games: [] });
        }

        const topGame = topGameResult.rows[0];
        const cacheKey = `recommended:${topGame.igdb_id}`;
        
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            return res.json({ basedOn: topGame.title, games: JSON.parse(cached) });
        }

        const token = await getTwitchToken();
        const query = `
            fields similar_games.name, similar_games.cover.image_id, similar_games.first_release_date;
            where id = ${topGame.igdb_id};
        `;

        const response = await axios.post('https://api.igdb.com/v4/games', query, {
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (response.data.length === 0 || !response.data[0].similar_games) {
            return res.json({ basedOn: topGame.title, games: [] });
        }

        const recommendedGames = response.data[0].similar_games.map(game => ({
            id: game.id,
            title: game.name,
            cover_url: game.cover?.image_id ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg` : 'https://via.placeholder.com/200x300?text=No+Cover',
            release_date: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString().split('T')[0] : 'N/A'
        }));

        await redisClient.set(cacheKey, JSON.stringify(recommendedGames), { EX: 86400 }); // Cache for 24 hours
        res.json({ basedOn: topGame.title, games: recommendedGames });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch recommendations' });
    }
});

// Game detail by rawgId (which is now IGDB ID)
router.get('/:rawgId', async (req, res) => {
    try {
        const { rawgId } = req.params;
        
        // Cache Check
        const cacheKey = `game:${rawgId}`;
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            return res.json(JSON.parse(cached));
        }

        const token = await getTwitchToken();

        const query = `
            fields name, cover.image_id, first_release_date, total_rating, genres.name, summary, storyline, screenshots.image_id, artworks.image_id, involved_companies.company.name, involved_companies.developer, platforms.name, themes.name, similar_games.name, similar_games.cover.image_id, videos.video_id, videos.name;
            where id = ${rawgId};
        `;

        const response = await axios.post('https://api.igdb.com/v4/games', query, {
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (response.data.length === 0) {
            return res.status(404).json({ message: 'Game not found' });
        }

        const game = response.data[0];

        let description = game.summary || game.storyline || 'No description available.';
        if (description.length > 600) {
            description = description.substring(0, 597) + '...';
        }

        let trailer = null;
        if (game.videos && game.videos.length > 0) {
            const trailerVideo = game.videos.find(v => v.name && v.name.toLowerCase().includes('trailer'));
            trailer = trailerVideo ? trailerVideo.video_id : game.videos[0].video_id;
        }

        const gameData = {
            id: game.id,
            title: game.name,
            cover_url: game.cover?.image_id ? `https://images.igdb.com/igdb/image/upload/t_1080p/${game.cover.image_id}.jpg` : 'https://via.placeholder.com/200x300?text=No+Cover',
            background_url: game.artworks && game.artworks.length > 0 ? `https://images.igdb.com/igdb/image/upload/t_1080p/${game.artworks[0].image_id}.jpg` : game.screenshots && game.screenshots.length > 0 ? `https://images.igdb.com/igdb/image/upload/t_1080p/${game.screenshots[0].image_id}.jpg` : '',
            release_date: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString().split('T')[0] : 'N/A',
            rawg_rating: game.total_rating ? parseFloat((game.total_rating / 10).toFixed(1)) : null,
            genres: game.genres ? game.genres.map(g => g.name) : [],
            description: description,
            developer: game.involved_companies ? game.involved_companies.find(c => c.developer)?.company?.name || 'Unknown' : 'Unknown',
            platforms: game.platforms ? game.platforms.map(p => p.name) : [],
            themes: game.themes ? game.themes.map(t => t.name) : [],
            trailer: trailer,
            similar_games: game.similar_games ? game.similar_games.map(sg => ({
                id: sg.id,
                title: sg.name,
                cover_url: sg.cover?.image_id ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${sg.cover.image_id}.jpg` : 'https://via.placeholder.com/200x300?text=No+Cover'
            })) : []
        };

        // Cache the formatted data
        await redisClient.set(cacheKey, JSON.stringify(gameData), { EX: 86400 }); // Cache for 24 hours

        // Also save core details to local PostgreSQL to ensure foreign key integrity
        // IGDB id becomes rawg_id in our DB.
        const checkResult = await db.query('SELECT id FROM games WHERE rawg_id = $1', [rawgId]);
        
        if (checkResult.rows.length === 0) {
            await db.query(
                `INSERT INTO games (rawg_id, title, cover_url, release_date, rawg_rating, genres) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [gameData.id, gameData.title, gameData.cover_url, gameData.release_date, gameData.rawg_rating, gameData.genres]
            );
        }

        res.json(gameData);
    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).json({ message: 'Failed to fetch game details' });
    }
});

module.exports = router;
