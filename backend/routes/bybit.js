
const express = require('express');
const bybitController = require('../controllers/bybitController');
const router = express.Router();

// Account endpoints
router.get('/balance', bybitController.getBalance);
router.get('/positions', bybitController.getPositions);
router.get('/stats', bybitController.getStats);
router.get('/performance', bybitController.getPerformance);

// Trading endpoints
router.post('/orders', bybitController.placeOrder);
router.delete('/orders/:id', bybitController.cancelOrder);
router.get('/orders', bybitController.getOrders);

// Add a health check endpoint for testing backend connection
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Bybit API is running' });
});

// Add an endpoint for setting API credentials
router.post('/setCredentials', (req, res) => {
  try {
    const { apiKey, apiSecret, isTestnet } = req.body;
    
    if (!apiKey || !apiSecret) {
      return res.status(400).json({ error: 'API key and secret are required' });
    }
    
    // Store credentials (this is a simple implementation - in production, use secure storage)
    req.app.locals.bybitCredentials = {
      apiKey,
      apiSecret,
      isTestnet: isTestnet === undefined ? true : isTestnet
    };
    
    res.status(200).json({ success: true, message: 'Credentials set successfully' });
  } catch (error) {
    console.error('Error setting credentials:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

module.exports = router;
