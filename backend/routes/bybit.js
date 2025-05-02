
const express = require('express');
const bybitController = require('../controllers/bybitController');
const router = express.Router();

router.get('/balance', bybitController.getBalance);
router.get('/positions', bybitController.getPositions);
router.get('/stats', bybitController.getStats);
router.get('/performance', bybitController.getPerformance);
router.post('/orders', bybitController.placeOrder);
router.delete('/orders/:id', bybitController.cancelOrder);
router.get('/orders', bybitController.getOrders);

module.exports = router;
