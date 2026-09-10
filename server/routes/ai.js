const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const axios = require('axios');

router.post('/recommend', auth, async (req, res) => {
    try {
        const { mood } = req.body;
        if (!mood) return res.status(400).json({ message: 'Mood/preference is required' });

        // 1. Fetch user's library context
        const libraryResult = await db.query(`
            SELECT g.title, ug.status, ug.rating
            FROM user_games ug
            JOIN games g ON ug.game_id = g.id
            WHERE ug.user_id = $1
        `, [req.user.id]);

        const playedGamesContext = libraryResult.rows.map(row => 
            `- ${row.title} (Status: ${row.status}, Rating: ${row.rating || 'N/A'})`
        ).join('\n');

        // 2. Build Claude Prompt
        const prompt = `
        You are an expert video game recommender AI. The user is looking for game recommendations based on this mood/preference: "${mood}".
        
        Here is the user's current game library and ratings:
        ${playedGamesContext ? playedGamesContext : '(User has an empty library)'}

        Based on their library (do not recommend games they have already played) and their requested mood, provide exactly 5 game recommendations.
        
        You must return the result as a strict JSON array of objects. Do NOT wrap the JSON in markdown code blocks. Just output the raw JSON array.
        Each object must have these exact keys:
        - "title" (string)
        - "reason" (string, explaining why it fits their mood and relates to their taste)
        - "genres" (array of strings, up to 3 genres)
        
        Output only the JSON.
        `;

        // 3. Call Claude API
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
            model: 'claude-3-haiku-20240307',
            max_tokens: 1000,
            temperature: 0.7,
            messages: [{ role: 'user', content: prompt }]
        }, {
            headers: {
                'x-api-key': process.env.CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            }
        });

        const claudeText = response.data.content[0].text;
        
        // Parse the JSON safely (Claude might sometimes include markdown blocks despite instructions)
        let parsedData;
        try {
            const jsonMatch = claudeText.match(/\[[\s\S]*\]/);
            const jsonString = jsonMatch ? jsonMatch[0] : claudeText;
            parsedData = JSON.parse(jsonString);
        } catch (parseErr) {
            console.error("Claude parsing error:", parseErr, "Raw output:", claudeText);
            return res.status(500).json({ message: 'Failed to parse AI response' });
        }

        res.json(parsedData);
    } catch (err) {
        console.error(err.response?.data || err);
        res.status(500).json({ message: 'Failed to get recommendations from AI' });
    }
});

module.exports = router;
