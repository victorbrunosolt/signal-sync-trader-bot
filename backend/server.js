
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const telegramRoutes = require('./routes/telegram');
const bybitRoutes = require('./routes/bybit');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message || 'An unexpected error occurred'
  });
});

// Root health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API server is running' });
});

// Routes
app.use('/api/telegram', telegramRoutes);
app.use('/api/bybit', bybitRoutes);

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not Found', message: 'The requested endpoint does not exist' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // In production, you might want to implement a graceful shutdown or restart mechanism
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // In production, you might want to implement a graceful shutdown or restart mechanism
});
