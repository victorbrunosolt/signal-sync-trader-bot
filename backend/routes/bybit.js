
const express = require('express');
const bybitController = require('../controllers/bybitController');
const router = express.Router();

// Middleware to validate API credentials are set
const checkCredentials = (req, res, next) => {
  const credentials = req.app.locals.bybitCredentials || 
    bybitController.loadCredentials();
  
  if (!credentials || !credentials.key || !credentials.secret) {
    return res.status(401).json({ 
      error: 'Not authenticated', 
      message: 'API credentials are not set' 
    });
  }
  
  next();
};

// Account endpoints
router.get('/balance', checkCredentials, bybitController.getBalance);
router.get('/positions', checkCredentials, bybitController.getPositions);
router.get('/stats', checkCredentials, bybitController.getStats);
router.get('/performance', checkCredentials, bybitController.getPerformance);

// Trading endpoints
router.post('/orders', checkCredentials, bybitController.placeOrder);
router.delete('/orders/:id', checkCredentials, bybitController.cancelOrder);
router.get('/orders', checkCredentials, bybitController.getOrders);

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
    
    // Save credentials to the controller and app locals
    bybitController.saveApiCredentials(apiKey, apiSecret, isTestnet === undefined ? true : isTestnet);
    
    // Also store in app.locals for in-memory access
    req.app.locals.bybitCredentials = {
      key: apiKey,
      secret: apiSecret,
      isTestnet: isTestnet === undefined ? true : isTestnet
    };
    
    res.status(200).json({ success: true, message: 'Credentials set successfully' });
  } catch (error) {
    console.error('Error setting credentials:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Clear credentials endpoint
router.post('/clearCredentials', (req, res) => {
  try {
    req.app.locals.bybitCredentials = null;
    bybitController.clearCredentials();
    res.status(200).json({ success: true, message: 'Credentials cleared successfully' });
  } catch (error) {
    console.error('Error clearing credentials:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Validate credentials endpoint
router.post('/validateCredentials', async (req, res) => {
  try {
    const { apiKey, apiSecret, isTestnet } = req.body;
    
    if (!apiKey || !apiSecret) {
      return res.status(400).json({ 
        success: false, 
        error: 'API key and secret are required' 
      });
    }
    
    const isValid = await bybitController.validateApiCredentials(
      apiKey, 
      apiSecret, 
      isTestnet === undefined ? true : isTestnet
    );
    
    if (isValid) {
      res.status(200).json({ 
        success: true,
        message: 'Credentials are valid'
      });
    } else {
      res.status(401).json({ 
        success: false,
        error: 'Invalid credentials',
        message: 'Could not authenticate with the provided API key and secret'
      });
    }
  } catch (error) {
    console.error('Error validating credentials:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Internal Server Error'
    });
  }
});

module.exports = router;
