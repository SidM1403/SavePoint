const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://admin:secret@localhost:5432/questlog',
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle pg client', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
