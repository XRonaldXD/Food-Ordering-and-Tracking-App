const User = require('../models/User');
const Order = require('../models/Order');
const Food = require('../models/Food');

// Middleware to check admin role
const checkAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
    next();
};

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user role
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, restaurantName } = req.body;

        if (!['customer', 'merchant', 'driver', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const updateData = { role };
        if (role === 'merchant' && restaurantName) {
            updateData.restaurantName = restaurantName;
        }

        const user = await User.findByIdAndUpdate(id, updateData, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User role updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Toggle user active status
const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({ 
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, 
            user 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all orders with filters
const getAllOrders = async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;
        let query = {};

        if (status) {
            query.status = status;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const orders = await Order.find(query)
            .populate('foodId')
            .populate('createdBy', 'name email profilePicture')
            .populate('merchantId', 'name restaurantName')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update order status (admin override)
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const validStatuses = ['pending', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'rejected', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status;
        order.statusHistory.push({
            status: status,
            timestamp: new Date(),
            updatedBy: 'Admin',
            notes: notes || `Status updated by admin to ${status}`
        });

        if (status === 'delivered') {
            order.deliveredAt = new Date();
        }

        await order.save();

        const populatedOrder = await Order.findById(id)
            .populate('foodId')
            .populate('createdBy', 'name email profilePicture');

        res.json({ message: 'Order status updated', order: populatedOrder });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete order
const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByIdAndDelete(id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all foods
const getAllFoods = async (req, res) => {
    try {
        const foods = await Food.find()
            .populate('createdBy', 'name email restaurantName')
            .sort({ createdAt: -1 });
        res.json(foods);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete food
const deleteFood = async (req, res) => {
    try {
        const { id } = req.params;
        const food = await Food.findByIdAndDelete(id);
        
        if (!food) {
            return res.status(404).json({ message: 'Food item not found' });
        }

        res.json({ message: 'Food item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get system statistics
const getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const totalMerchants = await User.countDocuments({ role: 'merchant' });
        const totalDrivers = await User.countDocuments({ role: 'driver' });
        const activeUsers = await User.countDocuments({ isActive: true });

        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const completedOrders = await Order.countDocuments({ status: 'delivered' });
        const cancelledOrders = await Order.countDocuments({ status: { $in: ['cancelled', 'rejected'] } });

        const totalFoods = await Food.countDocuments();

        // Calculate total revenue
        const completedOrdersList = await Order.find({ status: 'delivered' }).populate('foodId');
        const totalRevenue = completedOrdersList.reduce((sum, order) => {
            return sum + (order.totalAmount || 0);
        }, 0);

        // Orders by status
        const ordersByStatus = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Recent activity
        const recentOrders = await Order.find()
            .populate('foodId', 'name')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            users: {
                total: totalUsers,
                customers: totalCustomers,
                merchants: totalMerchants,
                drivers: totalDrivers,
                active: activeUsers
            },
            orders: {
                total: totalOrders,
                pending: pendingOrders,
                completed: completedOrders,
                cancelled: cancelledOrders,
                byStatus: ordersByStatus
            },
            foods: {
                total: totalFoods
            },
            revenue: {
                total: totalRevenue.toFixed(2)
            },
            recentActivity: {
                orders: recentOrders,
                users: recentUsers
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get analytics data
const getAnalytics = async (req, res) => {
    try {
        const { period = '30' } = req.query; // days
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period));

        // Orders over time
        const ordersOverTime = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Top merchants
        const topMerchants = await Food.aggregate([
            {
                $lookup: {
                    from: 'orders',
                    localField: '_id',
                    foreignField: 'foodId',
                    as: 'orders'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'merchant'
                }
            },
            {
                $unwind: '$merchant'
            },
            {
                $group: {
                    _id: '$createdBy',
                    merchantName: { $first: '$merchant.name' },
                    restaurantName: { $first: '$merchant.restaurantName' },
                    totalOrders: { $sum: { $size: '$orders' } },
                    totalRevenue: {
                        $sum: {
                            $reduce: {
                                input: '$orders',
                                initialValue: 0,
                                in: { $add: ['$$value', '$$this.totalAmount'] }
                            }
                        }
                    }
                }
            },
            {
                $sort: { totalRevenue: -1 }
            },
            {
                $limit: 5
            }
        ]);

        // Top foods
        const topFoods = await Order.aggregate([
            {
                $match: {
                    status: 'delivered'
                }
            },
            {
                $group: {
                    _id: '$foodId',
                    orderCount: { $sum: 1 },
                    totalQuantity: { $sum: '$quantity' },
                    revenue: { $sum: '$totalAmount' }
                }
            },
            {
                $lookup: {
                    from: 'foods',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'food'
                }
            },
            {
                $unwind: '$food'
            },
            {
                $sort: { orderCount: -1 }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    name: '$food.name',
                    restaurant: '$food.restaurant',
                    orderCount: 1,
                    totalQuantity: 1,
                    revenue: 1
                }
            }
        ]);

        res.json({
            ordersOverTime,
            topMerchants,
            topFoods
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    checkAdmin,
    getAllUsers,
    getUserById,
    updateUserRole,
    toggleUserStatus,
    deleteUser,
    getAllOrders,
    updateOrderStatus,
    deleteOrder,
    getAllFoods,
    deleteFood,
    getSystemStats,
    getAnalytics
};
