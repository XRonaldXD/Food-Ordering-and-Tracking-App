const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Not authenticated' });
}

// Middleware to check if user is a driver
function checkDriver(req, res, next) {
    if (req.user && (req.user.role === 'driver' || req.user.role === 'admin')) {
        return next();
    }
    res.status(403).json({ error: 'Access denied. Driver role required.' });
}

// Get all available orders (ready for delivery)
router.get('/available-orders', isAuthenticated, checkDriver, driverController.getAvailableOrders);

// Get driver's assigned orders
router.get('/my-orders', isAuthenticated, checkDriver, driverController.getDriverOrders);

// Accept delivery order
router.post('/orders/:orderId/accept', isAuthenticated, checkDriver, driverController.acceptDelivery);

// Mark order as delivered
router.put('/orders/:orderId/deliver', isAuthenticated, checkDriver, driverController.markAsDelivered);

// Get driver statistics
router.get('/stats', isAuthenticated, checkDriver, driverController.getDriverStats);

// Get order details
router.get('/orders/:orderId', isAuthenticated, checkDriver, driverController.getOrderDetails);

module.exports = router;
