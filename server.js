// server.js
require('dotenv').config();
const express = require('express');
const alertsRoute = require('./routes/alerts');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use(alertsRoute);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'StockFlow API is running!' });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});