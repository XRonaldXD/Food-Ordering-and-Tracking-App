const Order = require('../models/Order');

// Update driver location (called by driver app)
exports.updateDriverLocation = async (req, res) => {
    try {
        const { orderId, latitude, longitude } = req.body;
        
        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check if user is the assigned driver
        if (!order.driverId || order.driverId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this order location' });
        }

        // Update driver location
        order.driverLocation = {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            lastUpdated: new Date()
        };

        await order.save();

        res.json({ 
            message: 'Location updated successfully',
            location: order.driverLocation
        });
    } catch (error) {
        console.error('Error updating driver location:', error);
        res.status(500).json({ error: 'Failed to update location' });
    }
};

// Get order tracking information (for customer)
exports.getOrderTracking = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId)
            .populate('foodId', 'name restaurant price')
            .populate('driverId', 'name email')
            .populate('merchantId', 'name')
            .populate('createdBy', 'name email');

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check if user is authorized (customer, driver, merchant, or admin)
        const isAuthorized = 
            order.createdBy._id.toString() === req.user._id.toString() ||
            (order.driverId && order.driverId._id.toString() === req.user._id.toString()) ||
            (order.merchantId && order.merchantId.toString() === req.user._id.toString()) ||
            req.user.role === 'admin';

        if (!isAuthorized) {
            return res.status(403).json({ error: 'Not authorized to view this order' });
        }

        // Return tracking information
        const trackingInfo = {
            orderId: order._id,
            status: order.status,
            foodName: order.foodId.name,
            restaurant: order.foodId.restaurant,
            quantity: order.quantity,
            totalAmount: order.totalAmount,
            deliveryAddress: order.deliveryAddress,
            customerPhone: order.customerPhone,
            estimatedDeliveryTime: order.estimatedDeliveryTime,
            driverLocation: order.driverLocation,
            deliveryLocation: order.deliveryLocation,
            driver: order.driverId ? {
                name: order.driverId.name,
                phone: order.driverId.email // You can add phone field to User model
            } : null,
            statusHistory: order.statusHistory,
            createdAt: order.createdAt,
            acceptedAt: order.acceptedAt,
            readyAt: order.readyAt,
            pickedUpAt: order.pickedUpAt,
            deliveredAt: order.deliveredAt
        };

        res.json(trackingInfo);
    } catch (error) {
        console.error('Error getting order tracking:', error);
        res.status(500).json({ error: 'Failed to get tracking information' });
    }
};

// Set delivery location coordinates (can be done when order is created or updated)
exports.setDeliveryLocation = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { latitude, longitude, address } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check if user is the customer or admin
        if (order.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        order.deliveryLocation = {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            address: address || order.deliveryAddress
        };

        await order.save();

        res.json({ 
            message: 'Delivery location updated',
            deliveryLocation: order.deliveryLocation
        });
    } catch (error) {
        console.error('Error setting delivery location:', error);
        res.status(500).json({ error: 'Failed to set delivery location' });
    }
};

// Calculate estimated delivery time based on distance
exports.updateEstimatedTime = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { estimatedMinutes } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check if user is driver or admin
        if ((!order.driverId || order.driverId.toString() !== req.user._id.toString()) && 
            req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const estimatedTime = new Date();
        estimatedTime.setMinutes(estimatedTime.getMinutes() + parseInt(estimatedMinutes));
        
        order.estimatedDeliveryTime = estimatedTime;
        await order.save();

        res.json({ 
            message: 'Estimated delivery time updated',
            estimatedDeliveryTime: order.estimatedDeliveryTime
        });
    } catch (error) {
        console.error('Error updating estimated time:', error);
        res.status(500).json({ error: 'Failed to update estimated time' });
    }
};
