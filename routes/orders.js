const express = require("express");
const OrderController = require("../controllers/orderController");
const router = express.Router();

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Not authenticated' });
}

// Create a new order (requires authentication)
router.post("/", isAuthenticated, OrderController.createOrder);
// Get all orders
router.get("/", OrderController.getOrders);
// Get a specific order by ID
router.get("/:id", OrderController.getSpecOrder);
// Update an order by ID
router.put("/:id", isAuthenticated, OrderController.updateOrder);
// Delete an order by ID
router.delete("/:id", isAuthenticated, OrderController.deleteOrder);


module.exports = router;
