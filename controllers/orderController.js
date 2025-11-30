const Order = require('../models/Order');


const createOrder = async (req, res) => {

    if(!req.user) {
        return res.status(401).json({ message: 'You must be logged in to create an order' });
    }

    const newOrder = new Order({
        ...req.body,
        createdBy: req.user._id  // Add user ID from authenticated session
    });
    try {
        await newOrder.save();
        res.json(newOrder);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }

}

const getOrders = async (req, res) => {
    try {
        const order = await Order.find();
        res.json(order);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const getSpecOrder = async (req, res) => {
    const id = req.params.id;
    try {
        const order = await Order.findById(id);
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
