const Order = require('../models/Order');
const User = require('../models/User');
const systemLogger = require('../utils/systemLogger');

// Get all available orders (ready for delivery)
exports.getAvailableOrders = async (req, res) => {
    try {
        const orders = await Order.find({ 
            status: 'ready',
            driverId: null 
        })
        .populate('foodId')
        .populate('createdBy', 'name email')
        .populate('merchantId', 'name restaurantName')
        .sort({ readyAt: 1 });

        res.json(orders);
    } catch (error) {
        console.error('Error fetching available orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

// Get driver's assigned orders
exports.getDriverOrders = async (req, res) => {
    try {
        const orders = await Order.find({ 
            driverId: req.user._id,
            status: { $in: ['out_for_delivery', 'delivered'] }
        })
        .populate('foodId')
        .populate('createdBy', 'name email profilePicture')
        .populate('merchantId', 'name restaurantName')
        .sort({ pickedUpAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error('Error fetching driver orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

// Accept delivery order
exports.acceptDelivery = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.status !== 'ready') {
            return res.status(400).json({ error: 'Order is not ready for delivery' });
        }

        if (order.driverId) {
            return res.status(400).json({ error: 'Order already assigned to another driver' });
        }

        order.driverId = req.user._id;
        order.status = 'out_for_delivery';
        order.pickedUpAt = new Date();
        order.statusHistory.push({
            status: 'out_for_delivery',
            timestamp: new Date(),
            updatedBy: req.user.name,
            notes: 'Order picked up by driver'
        });

        await order.save();

        const updatedOrder = await Order.findById(orderId)
            .populate('foodId')
            .populate('createdBy', 'name email profilePicture')
            .populate('merchantId', 'name restaurantName');

        // Send system notification to customer
        await systemLogger.logOrderOutForDelivery(order.createdBy, {
            orderId: order._id,
            foodName: updatedOrder.foodId.name,
            driverName: req.user.name
        });

        res.json(updatedOrder);
    } catch (error) {
        console.error('Error accepting delivery:', error);
        res.status(500).json({ error: 'Failed to accept delivery' });
    }
};

// Mark order as delivered
exports.markAsDelivered = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { notes } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.driverId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this order' });
        }

        if (order.status !== 'out_for_delivery') {
            return res.status(400).json({ error: 'Order is not out for delivery' });
        }

        order.status = 'delivered';
        order.deliveredAt = new Date();
        order.statusHistory.push({
            status: 'delivered',
            timestamp: new Date(),
            updatedBy: req.user.name,
            notes: notes || 'Order delivered successfully'
        });

        await order.save();

        const updatedOrder = await Order.findById(orderId)
            .populate('foodId')
            .populate('createdBy', 'name email profilePicture')
            .populate('merchantId', 'name restaurantName');

        // Send system notification to customer
        await systemLogger.logOrderDelivered(order.createdBy, {
            orderId: order._id,
            foodName: updatedOrder.foodId.name
        });

        res.json(updatedOrder);
    } catch (error) {
        console.error('Error marking as delivered:', error);
        res.status(500).json({ error: 'Failed to mark as delivered' });
    }
};

// Get driver statistics
exports.getDriverStats = async (req, res) => {
    try {
        const driverId = req.user._id;

        // Total deliveries
        const totalDeliveries = await Order.countDocuments({ 
            driverId,
            status: 'delivered'
        });

        // Active deliveries
        const activeDeliveries = await Order.countDocuments({ 
            driverId,
            status: 'out_for_delivery'
        });

        // Total earnings (assuming delivery fee or commission)
        const earnings = await Order.aggregate([
            { 
                $match: { 
                    driverId: req.user._id,
                    status: 'delivered'
                } 
            },
            { 
                $group: { 
                    _id: null, 
                    total: { $sum: '$totalAmount' } 
                } 
            }
        ]);

        // Today's deliveries
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayDeliveries = await Order.countDocuments({
            driverId,
            status: 'delivered',
            deliveredAt: { $gte: today }
        });

        res.json({
            totalDeliveries,
            activeDeliveries,
            totalEarnings: earnings.length > 0 ? earnings[0].total * 0.1 : 0, // 10% commission
            todayDeliveries
        });
    } catch (error) {
        console.error('Error fetching driver stats:', error);
        res.status(500).json({ error: 'Failed to fetch driver stats' });
    }
};

// Get order details with location
exports.getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId)
            .populate('foodId')
            .populate('createdBy', 'name email profilePicture')
            .populate('merchantId', 'name restaurantName email')
            .populate('driverId', 'name email profilePicture');

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.driverId && order.driverId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to view this order' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ error: 'Failed to fetch order details' });
    }
};
