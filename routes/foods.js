const express = require("express");
const FoodController = require("../controllers/foodController");
const router = express.Router();

// Get all foods
router.get('/', FoodController.getFoods);
// Create a new food item
router.post('/', FoodController.createFood);
// Get a specific food by ID
router.get('/:id', FoodController.getSpecFood);
// Update a food by ID  
router.put('/:id', FoodController.updateFood);
// Delete a food by ID
router.delete('/:id', FoodController.deleteFood);

module.exports = router;
