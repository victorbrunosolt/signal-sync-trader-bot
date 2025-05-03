
const express = require('express');
const telegramController = require('../controllers/telegramController');
const router = express.Router();

// Authentication
router.post('/auth/init', telegramController.initAuth);
router.post('/auth/confirm', telegramController.confirmAuth);
router.post('/auth/2fa', telegramController.confirm2FA);

// Groups
router.get('/groups', telegramController.getGroups);
router.post('/groups', telegramController.addGroup);
router.put('/groups/:id', telegramController.updateGroupStatus);
router.delete('/groups/:id', telegramController.removeGroup);

// Signal parsing
router.post('/parser/test', telegramController.testParseTemplate);
router.post('/parser/config', telegramController.saveParserConfig);

// Signals
router.get('/signals', telegramController.getSignals);

module.exports = router;
