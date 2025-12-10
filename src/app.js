const express = require('express');
const searchRoutes = require('./routes/searchRoutes');

const app = express();

app.use(express.json());

app.use('/search', searchRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
