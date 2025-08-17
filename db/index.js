// db/index.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool();

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
  } else {
    console.log('✅ Database connected:', res.rows[0].now);
  }
});

module.exports = pool;