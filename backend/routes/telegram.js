
const express = require('express');
const telegramController = require('../controllers/telegramController');
const router = express.Router();

// Authentication endpoints with explicit error handling
router.post('/auth/init', telegramController.initAuth);
router.post('/auth/confirm', telegramController.confirmAuth);
router.post('/auth/2fa', telegramController.confirm2FA);

// Groups management
router.get('/groups', telegramController.getGroups);
router.post('/groups', telegramController.addGroup);
router.put('/groups/:id', telegramController.updateGroupStatus);
router.delete('/groups/:id', telegramController.removeGroup);

// Signal parsing
router.post('/parser/test', telegramController.testParseTemplate);
router.post('/parser/config', telegramController.saveParserConfig);

// Signals
router.get('/signals', telegramController.getSignals);

// Add a health check endpoint for testing backend connection
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Telegram API is running' });
});

module.exports = router;
