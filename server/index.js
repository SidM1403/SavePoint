require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'QuestLog API is running' });
});

const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/games');
const libraryRoutes = require('./routes/library');
const aiRoutes = require('./routes/ai');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');
const listRoutes = require('./routes/lists');

app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lists', listRoutes);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
