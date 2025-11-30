const Order = require('../models/Order');
const Food = require('../models/Food');

// Get all orders for a merchant's restaurant
const getMerchantOrders = async (req, res) => {
    try {
        if (!req.user || (req.user.role !== 'merchant' && req.user.role !== 'admin')) {
            return res.status(403).json({ message: 'Access denied. Merchant role required.' });
        }

        let orders;
        if (req.user.role === 'admin') {
            // Admin can see all orders
            orders = await Order.find({})
                .populate('foodId')
                .populate('createdBy', 'name email profilePicture')
                .sort({ createdAt: -1 });
        } else {
            // Get all foods created by this merchant
            const merchantFoods = await Food.find({ createdBy: req.user._id });
            const foodIds = merchantFoods.map(food => food._id);

            // Get all orders for these foods
            orders = await Order.find({ foodId: { $in: foodIds } })
                .populate('foodId')
                .populate('createdBy', 'name email profilePicture')
                .sort({ createdAt: -1 });
        }

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get pending orders for merchant
const getPendingOrders = async (req, res) => {
    try {
        if (!req.user || (req.user.role !== 'merchant' && req.user.role !== 'admin')) {
            return res.status(403).json({ message: 'Access denied. Merchant role required.' });
        }

        let orders;
        if (req.user.role === 'admin') {
            // Admin can see all pending orders
            orders = await Order.find({ status: 'pending' })
                .populate('foodId')
                .populate('createdBy', 'name email profilePicture')
                .sort({ createdAt: -1 });
        } else {
            const merchantFoods = await Food.find({ createdBy: req.user._id });
            const foodIds = merchantFoods.map(food => food._id);

            orders = await Order.find({ 
                foodId: { $in: foodIds },
                status: 'pending'
            })
                .populate('foodId')
                .populate('createdBy', 'name email profilePicture')
                .sort({ createdAt: -1 });
        }

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Accept an order
const acceptOrder = async (req, res) => {
    try {
        if (!req.user || (req.user.role !== 'merchant' && req.user.role !== 'admin')) {
            return res.status(403).json({ message: 'Access denied. Merchant role required.' });
        }

        const { id } = req.params;
        const { estimatedTime, merchantNotes } = req.body;

        const order = await Order.findById(id).populate('foodId');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify this order belongs to merchant's food (skip for admin)
        if (req.user.role !== 'admin') {
            const food = await Food.findById(order.foodId._id);
            if (food.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to manage this order' });
            }
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Order cannot be accepted. Current status: ' + order.status });
        }

        order.status = 'accepted';
        order.merchantId = req.user._id;
        order.acceptedAt = new Date();
        if (merchantNotes) order.merchantNotes = merchantNotes;
        
        order.statusHistory.push({
            status: 'accepted',
            timestamp: new Date(),
            updatedBy: req.user.name,
            notes: merchantNotes || 'Order accepted by merchant'
        });

        await order.save();

        const populatedOrder = await Order.findById(id)
            .populate('foodId')
            .populate('createdBy', 'name email profilePicture');

        res.json({ 
            message: 'Order accepted successfully',
            order: populatedOrder
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reject an order
const rejectOrder = async (req, res) => {
    try {
        if (!req.user || (req.user.role !== 'merchant' && req.user.role !== 'admin')) {
            return res.status(403).json({ message: 'Access denied. Merchant role required.' });
        }

        const { id } = req.params;
        const { rejectionReason } = req.body;

        if (!rejectionReason) {
            return res.status(400).json({ message: 'Rejection reason is required' });
        }

        const order = await Order.findById(id).populate('foodId');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify this order belongs to merchant's food (skip for admin)
        if (req.user.role !== 'admin') {
            const food = await Food.findById(order.foodId._id);
            if (food.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to manage this order' });
            }
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending orders can be rejected' });
        }

        order.status = 'rejected';
        order.rejectionReason = rejectionReason;
        order.merchantId = req.user._id;
        
        order.statusHistory.push({
            status: 'rejected',
            timestamp: new Date(),
            updatedBy: req.user.name,
            notes: rejectionReason
        });

        await order.save();

        const populatedOrder = await Order.findById(id)
            .populate('foodId')
            .populate('createdBy', 'name email profilePicture');

        res.json({ 
            message: 'Order rejected',
            order: populatedOrder
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update order to preparing
const startPreparingOrder = async (req, res) => {
    try {
        if (!req.user || (req.user.role !== 'merchant' && req.user.role !== 'admin')) {
            return res.status(403).json({ message: 'Access denied. Merchant role required.' });
        }

        const { id } = req.params;
        const { merchantNotes } = req.body;

        const order = await Order.findById(id).populate('foodId');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify this order belongs to merchant's food (skip for admin)
        if (req.user.role !== 'admin') {
            const food = await Food.findById(order.foodId._id);
            if (food.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to manage this order' });
            }
        }

        if (order.status !== 'accepted') {
            return res.status(400).json({ message: 'Order must be accepted before preparing' });
        }

        order.status = 'preparing';
        if (merchantNotes) order.merchantNotes = merchantNotes;
        
        order.statusHistory.push({
            status: 'preparing',
            timestamp: new Date(),
            updatedBy: req.user.name,
            notes: merchantNotes || 'Order is being prepared'
        });

        await order.save();

        const populatedOrder = await Order.findById(id)
            .populate('foodId')
            .populate('createdBy', 'name email profilePicture');

        res.json({ 
            message: 'Order status updated to preparing',
            order: populatedOrder
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark order as ready
const markOrderReady = async (req, res) => {
    try {
        if (!req.user || (req.user.role !== 'merchant' && req.user.role !== 'admin')) {
            return res.status(403).json({ message: 'Access denied. Merchant role required.' });
        }

        const { id } = req.params;
        const { merchantNotes } = req.body;

        const order = await Order.findById(id).populate('foodId');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify this order belongs to merchant's food (skip for admin)
        if (req.user.role !== 'admin') {
            const food = await Food.findById(order.foodId._id);
            if (food.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to manage this order' });
            }
        }

        if (order.status !== 'preparing') {
            return res.status(400).json({ message: 'Order must be in preparing status' });
        }

        order.status = 'ready';
        order.readyAt = new Date();
        if (merchantNotes) order.merchantNotes = merchantNotes;
        
        order.statusHistory.push({
            status: 'ready',
            timestamp: new Date(),
            updatedBy: req.user.name,
            notes: merchantNotes || 'Order is ready for pickup'
        });

        await order.save();

        const populatedOrder = await Order.findById(id)
            .populate('foodId')
            .populate('createdBy', 'name email profilePicture');

        res.json({ 
            message: 'Order marked as ready',
            order: populatedOrder
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Handle unavailable items / partial cancellation
const handleUnavailableItem = async (req, res) => {
    try {
        if (!req.user || (req.user.role !== 'merchant' && req.user.role !== 'admin')) {
            return res.status(403).json({ message: 'Access denied. Merchant role required.' });
        }

        const { id } = req.params;
        const { action, reason, substituteItem } = req.body;
        // action: 'cancel' or 'substitute'

        const order = await Order.findById(id).populate('foodId');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify this order belongs to merchant's food (skip for admin)
        if (req.user.role !== 'admin') {
            const food = await Food.findById(order.foodId._id);
            if (food.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to manage this order' });
            }
        }

        if (action === 'cancel') {
            order.status = 'cancelled';
            order.merchantNotes = `Item unavailable: ${reason}`;
            
            order.statusHistory.push({
                status: 'cancelled',
                timestamp: new Date(),
                updatedBy: req.user.name,
                notes: `Cancelled due to unavailable item: ${reason}`
            });
        } else if (action === 'substitute') {
            order.merchantNotes = `Original item unavailable. Substitute: ${substituteItem}. Reason: ${reason}`;
            
            order.statusHistory.push({
                status: order.status,
                timestamp: new Date(),
                updatedBy: req.user.name,
                notes: `Substitute offered: ${substituteItem}`
            });
        }

        await order.save();

        const populatedOrder = await Order.findById(id)
            .populate('foodId')
            .populate('createdBy', 'name email profilePicture');

        res.json({ 
            message: action === 'cancel' ? 'Order cancelled due to unavailable item' : 'Substitute item offered',
            order: populatedOrder
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get order statistics for merchant dashboard
const getMerchantStats = async (req, res) => {
    try {
        if (!req.user || (req.user.role !== 'merchant' && req.user.role !== 'admin')) {
            return res.status(403).json({ message: 'Access denied. Merchant role required.' });
        }

        let totalOrders, pendingOrders, acceptedOrders, preparingOrders, readyOrders, completedOrders, completedOrdersList;
        
        if (req.user.role === 'admin') {
            // Admin sees all orders stats
            totalOrders = await Order.countDocuments({});
            pendingOrders = await Order.countDocuments({ status: 'pending' });
            acceptedOrders = await Order.countDocuments({ status: 'accepted' });
            preparingOrders = await Order.countDocuments({ status: 'preparing' });
            readyOrders = await Order.countDocuments({ status: 'ready' });
            completedOrders = await Order.countDocuments({ status: 'delivered' });

            // Calculate total revenue for all orders
            completedOrdersList = await Order.find({ status: 'delivered' }).populate('foodId');
        } else {
            const merchantFoods = await Food.find({ createdBy: req.user._id });
            const foodIds = merchantFoods.map(food => food._id);

            totalOrders = await Order.countDocuments({ foodId: { $in: foodIds } });
            pendingOrders = await Order.countDocuments({ foodId: { $in: foodIds }, status: 'pending' });
            acceptedOrders = await Order.countDocuments({ foodId: { $in: foodIds }, status: 'accepted' });
            preparingOrders = await Order.countDocuments({ foodId: { $in: foodIds }, status: 'preparing' });
            readyOrders = await Order.countDocuments({ foodId: { $in: foodIds }, status: 'ready' });
            completedOrders = await Order.countDocuments({ foodId: { $in: foodIds }, status: 'delivered' });

            // Calculate total revenue
            completedOrdersList = await Order.find({ 
                foodId: { $in: foodIds }, 
                status: 'delivered' 
            }).populate('foodId');
        }
        
        const totalRevenue = completedOrdersList.reduce((sum, order) => {
            return sum + (order.foodId.price * order.quantity);
        }, 0);

        res.json({
            totalOrders,
            pendingOrders,
            acceptedOrders,
            preparingOrders,
            readyOrders,
            completedOrders,
            totalRevenue: totalRevenue.toFixed(2)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMerchantOrders,
    getPendingOrders,
    acceptOrder,
    rejectOrder,
    startPreparingOrder,
    markOrderReady,
    handleUnavailableItem,
    getMerchantStats
};
