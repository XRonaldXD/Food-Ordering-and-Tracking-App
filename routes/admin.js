const express = require("express");
const AdminController = require("../controllers/adminController");
const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Authentication required' });
};

// All routes require authentication and admin role
router.use(isAuthenticated);
router.use(AdminController.checkAdmin);

// System statistics and analytics
router.get('/stats', AdminController.getSystemStats);
router.get('/analytics', AdminController.getAnalytics);

// User management
router.get('/users', AdminController.getAllUsers);
router.get('/users/:id', AdminController.getUserById);
router.put('/users/:id/role', AdminController.updateUserRole);
router.put('/users/:id/toggle-status', AdminController.toggleUserStatus);
router.delete('/users/:id', AdminController.deleteUser);

// Order management
router.get('/orders', AdminController.getAllOrders);
router.put('/orders/:id/status', AdminController.updateOrderStatus);
router.delete('/orders/:id', AdminController.deleteOrder);

// Food management
router.get('/foods', AdminController.getAllFoods);
router.delete('/foods/:id', AdminController.deleteFood);

module.exports = router;
