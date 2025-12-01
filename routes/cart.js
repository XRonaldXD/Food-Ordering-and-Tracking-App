const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
}

// Get cart
router.get('/', isAuthenticated, cartController.getCart);

// Add to cart
router.post('/add', isAuthenticated, cartController.addToCart);

// Update cart item
router.put('/item/:itemId', isAuthenticated, cartController.updateCartItem);

// Remove from cart
router.delete('/item/:itemId', isAuthenticated, cartController.removeFromCart);

// Clear cart
router.delete('/clear', isAuthenticated, cartController.clearCart);

// Checkout
router.post('/checkout', isAuthenticated, cartController.checkout);

// Get cart count
router.get('/count', isAuthenticated, cartController.getCartCount);

module.exports = router;
