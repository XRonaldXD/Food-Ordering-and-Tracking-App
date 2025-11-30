const Food = require('../models/Food');


const createFood = async (req, res) => {
    // Check if user is authenticated
    if (!req.user) {
        return res.status(401).json({ message: 'You must be logged in to create a food item' });
    }
    
    try {
        const newFood = new Food({
            ...req.body,
            createdBy: req.user._id  // Add user ID from authenticated session
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
        await Food.findByIdAndUpdate(id, req.body, { new: true });
        const updateFood = await Food.findById(id);
        res.status(200).json(updateFood);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const deleteFood = async (req, res) => {
    const id = req.params.id;
    try {
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
