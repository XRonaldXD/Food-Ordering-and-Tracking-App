const express = require("express");
const FoodController = require("../controllers/foodController");
const router = express.Router();

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Not authenticated' });
}

// Get all foods (public)
router.get('/', FoodController.getFoods);
// Get a specific food by ID (public)
router.get('/:id', FoodController.getSpecFood);
// Create a new food item (merchants only)
router.post('/', isAuthenticated, FoodController.createFood);
// Update a food by ID (merchants only)
router.put('/:id', isAuthenticated, FoodController.updateFood);
// Delete a food by ID (merchants only)
router.delete('/:id', isAuthenticated, FoodController.deleteFood);

module.exports = router;
