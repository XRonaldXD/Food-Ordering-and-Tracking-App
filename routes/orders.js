const express = require("express");
const OrderController = require("../controllers/orderController");
const router = express.Router();

// Create a new order
router.post("/", OrderController.createOrder);
// Get all orders
router.get("/", OrderController.getOrders);
// Get a specific order by ID
router.get("/:id", OrderController.getSpecOrder);
// Update an order by ID
router.put("/:id", OrderController.updateOrder);
// Delete an order by ID
router.delete("/:id", OrderController.deleteOrder);


module.exports = router;
