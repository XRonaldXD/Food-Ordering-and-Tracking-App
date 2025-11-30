const Order = require('../models/Order');
const Food = require('../models/Food');


const createOrder = async (req, res) => {

    if(!req.user) {
        return res.status(401).json({ message: 'You must be logged in to create an order' });
    }

    try {
        const { foodId, quantity, notes, customerNotes } = req.body;

        // Validate required fields
        if (!foodId) {
            return res.status(400).json({ message: 'Food ID is required' });
        }

        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: 'Valid quantity is required' });
        }

        // Get food details to calculate total and set merchant
        const food = await Food.findById(foodId);
        if (!food) {
            return res.status(404).json({ message: 'Food item not found' });
        }

        const totalAmount = food.price * quantity;

        const newOrder = new Order({
            foodId: foodId,
            quantity: parseInt(quantity),
            createdBy: req.user._id,
            merchantId: food.createdBy,
            totalAmount: totalAmount,
            customerNotes: notes || customerNotes || '',
            notes: notes || customerNotes || '',
            status: 'pending',
            statusHistory: [{
                status: 'pending',
                timestamp: new Date(),
                updatedBy: req.user.name,
                notes: 'Order placed'
            }]
        });
        
        await newOrder.save();
        
        const populatedOrder = await Order.findById(newOrder._id)
            .populate('foodId')
            .populate('createdBy', 'name email profilePicture');
            
        res.status(201).json(populatedOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: error.message });
    }

}

const getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('foodId')
            .populate('createdBy', 'name email profilePicture')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const getSpecOrder = async (req, res) => {
    const id = req.params.id;
    try {
        const order = await Order.findById(id)
            .populate('foodId')
            .populate('createdBy', 'name email profilePicture');
        res.json(order);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const updateOrder = async (req, res) => {
    const id = req.params.id;

    try {
        await Order.findByIdAndUpdate(id, req.body, { new: true });
        const updateOrder = await Order.findById(id);
        res.status(200).json(updateOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const deleteOrder = async (req, res) => {
    const id = req.params.id;
    try {
        await Order.findByIdAndDelete(id);
        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    createOrder,
    getOrders,
    getSpecOrder,
    updateOrder,
    deleteOrder
};
