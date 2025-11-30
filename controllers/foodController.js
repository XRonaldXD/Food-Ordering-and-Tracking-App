const Food = require('../models/Food');


const createFood = async (req, res) => {
    // Check if user is authenticated
    if (!req.user) {
        return res.status(401).json({ message: 'You must be logged in to create a food item' });
    }

    // Check if user is a merchant
    if (req.user.role !== 'merchant' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only merchants can create food items' });
    }

    // Check if merchant has a restaurant name
    if (!req.user.restaurantName) {
        return res.status(400).json({ message: 'Please set your restaurant name in your profile first' });
    }
    
    try {
        const newFood = new Food({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            restaurant: req.user.restaurantName,  // Auto-populate from user's restaurant name
            createdBy: req.user._id
        });
        await newFood.save();
        res.json(newFood);
    } catch(error) {
        res.status(409).json({message: error.message});
    }
}

const getFoods = async (req, res) => {
    try {
        const food = await Food.find();
        res.json(food);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const getSpecFood = async (req, res) => {
    const id = req.params.id;
    try {
        const food = await Food.findById(id);
        res.json(food);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const updateFood = async (req, res) => {
    const id = req.params.id;
    
    try {
        // Check if user owns this food item or is admin
        const food = await Food.findById(id);
        if (!food) {
            return res.status(404).json({ message: 'Food item not found' });
        }

        if (food.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You can only update your own food items' });
        }

        // Prevent changing restaurant name (tied to user account)
        const updateData = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category
        };

        await Food.findByIdAndUpdate(id, updateData, { new: true });
        const updatedFood = await Food.findById(id);
        res.status(200).json(updatedFood);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const deleteFood = async (req, res) => {
    const id = req.params.id;
    try {
        // Check if user owns this food item or is admin
        const food = await Food.findById(id);
        if (!food) {
            return res.status(404).json({ message: 'Food item not found' });
        }

        if (food.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You can only delete your own food items' });
        }

        await Food.findByIdAndDelete(id);
        res.status(200).json({ message: "Food item deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    createFood,
    getFoods,
    getSpecFood,
    updateFood,
    deleteFood
};
