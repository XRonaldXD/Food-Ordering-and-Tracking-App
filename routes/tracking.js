const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
}

// Update driver location
router.post('/location', isAuthenticated, trackingController.updateDriverLocation);

// Get order tracking information
router.get('/:orderId', isAuthenticated, trackingController.getOrderTracking);

// Set delivery location coordinates
router.post('/:orderId/delivery-location', isAuthenticated, trackingController.setDeliveryLocation);

// Update estimated delivery time
router.post('/:orderId/estimated-time', isAuthenticated, trackingController.updateEstimatedTime);

module.exports = router;
