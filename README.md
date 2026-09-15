# SavePoint (QuestLog)

SavePoint (internally known as QuestLog) is a full-stack video game tracking and social platform. It allows users to track their gaming library, rate and review games, follow other gamers, and discover new titles.

## Features

- **Game Tracking:** Add games to your library and mark their status (Playing, Completed, Want to Play, etc.).
- **Social System:** Follow other users, view their libraries, and read their reviews.
- **Custom Lists:** Create private or public custom lists of games.
- **Cross-Platform:** Includes both a responsive web client and a mobile application.
- **Rich Data:** Features AI integrations, real game data (RAWG/IGDB), and caching.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (primary data) & Redis (caching)
- **Web Client:** React, React Router, Vite
- **Mobile Client:** React Native, Expo, React Navigation
- **Deployment:** Docker (for local development)

## Project Structure

```text
SavePoint/
├── client/          # React Web Application (Vite)
├── mobile/          # React Native Mobile Application (Expo)
├── server/          # Node.js Express Backend
├── docker-compose.yml # Local DB infrastructure (Postgres & Redis)
├── package.json     # Root package for running client/server concurrently
└── schema.sql       # Database schema setup
```

## Local Development Setup

To run the project locally, ensure you have **Node.js** and **Docker** installed.

1. **Install Dependencies**
   Run the following command from the root directory to install both server and client dependencies:
   ```bash
   npm run install:all
   ```

2. **Start the Application**
   The root `dev` script will start the Docker containers (Postgres and Redis) in the background and then concurrently start the Node server and React client:
   ```bash
   npm run dev
   ```
   
3. **Database Seeding (Optional)**
   To populate your local database with realistic dummy data (15 games, 10 users, reviews, followers, etc.):
   ```bash
   cd server
   node seed.js
   ```

4. **Running the Mobile App**
   To run the React Native mobile app:
   ```bash
   cd mobile
   npm install
   npm start
   ```

## Environment Variables
Ensure your `server/.env` is configured properly (the default values in `server/index.js` and `server/seed.js` point to the local Docker setup).

```env
PORT=5000
DATABASE_URL=postgres://admin:secret@localhost:5433/questlog
REDIS_URL=redis://localhost:6379
```
