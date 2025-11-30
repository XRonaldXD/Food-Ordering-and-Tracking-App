const express = require("express");
const MerchantOrderController = require("../controllers/merchantOrderController");
const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Authentication required' });
};

// Get all orders for merchant
router.get('/orders', isAuthenticated, MerchantOrderController.getMerchantOrders);

// Get pending orders
router.get('/orders/pending', isAuthenticated, MerchantOrderController.getPendingOrders);

// Get merchant statistics
router.get('/stats', isAuthenticated, MerchantOrderController.getMerchantStats);

// Accept an order
router.put('/orders/:id/accept', isAuthenticated, MerchantOrderController.acceptOrder);

// Reject an order
router.put('/orders/:id/reject', isAuthenticated, MerchantOrderController.rejectOrder);

// Start preparing order
router.put('/orders/:id/prepare', isAuthenticated, MerchantOrderController.startPreparingOrder);

// Mark order as ready
router.put('/orders/:id/ready', isAuthenticated, MerchantOrderController.markOrderReady);

// Handle unavailable items
router.put('/orders/:id/unavailable', isAuthenticated, MerchantOrderController.handleUnavailableItem);

module.exports = router;
