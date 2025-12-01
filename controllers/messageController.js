const Message = require('../models/Message');
const User = require('../models/User');
const Order = require('../models/Order');

// Get all conversations for current user
exports.getConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get all unique conversations
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: userId },
                        { receiver: userId }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: '$conversationId',
                    lastMessage: { $first: '$$ROOT' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { 
                                    $and: [
                                        { $eq: ['$receiver', userId] },
                                        { $eq: ['$isRead', false] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $sort: { 'lastMessage.createdAt': -1 }
            }
        ]);

        // Populate user details
        const populatedConversations = await Promise.all(
            conversations.map(async (conv) => {
                const lastMsg = conv.lastMessage;
                const otherUserId = lastMsg.sender.equals(userId) ? lastMsg.receiver : lastMsg.sender;
                
                const otherUser = await User.findById(otherUserId).select('name email role profilePicture restaurantName');
                const sender = await User.findById(lastMsg.sender).select('name');
                
                let orderInfo = null;
                if (lastMsg.orderId) {
                    orderInfo = await Order.findById(lastMsg.orderId)
                        .populate('foodId', 'name restaurant')
                        .select('foodId status');
                }

                return {
                    conversationId: conv._id,
                    otherUser,
                    lastMessage: {
                        _id: lastMsg._id,
                        message: lastMsg.message,
                        sender: sender,
                        createdAt: lastMsg.createdAt,
                        isRead: lastMsg.isRead
                    },
                    unreadCount: conv.unreadCount,
                    orderInfo
                };
            })
        );

        res.json(populatedConversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
};

// Get messages for a specific conversation
exports.getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;
        
        const conversationId = Message.getConversationId(currentUserId, userId);

        const messages = await Message.find({ conversationId })
            .populate('sender', 'name email role profilePicture')
            .populate('receiver', 'name email role profilePicture')
            .populate({
                path: 'orderId',
                populate: { path: 'foodId', select: 'name restaurant price' }
            })
            .sort({ createdAt: 1 });

        // Mark messages as read
        await Message.updateMany(
            {
                conversationId,
                receiver: currentUserId,
                isRead: false
            },
            {
                isRead: true,
                readAt: new Date()
            }
        );

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, message, orderId } = req.body;
        const senderId = req.user._id;

        if (!receiverId || !message) {
            return res.status(400).json({ error: 'Receiver and message are required' });
        }

        // Verify receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ error: 'Receiver not found' });
        }

        const conversationId = Message.getConversationId(senderId, receiverId);

        const newMessage = new Message({
            conversationId,
            sender: senderId,
            receiver: receiverId,
            message: message.trim(),
            orderId: orderId || null,
            isRead: false
        });

        await newMessage.save();

        const populatedMessage = await Message.findById(newMessage._id)
            .populate('sender', 'name email role profilePicture')
            .populate('receiver', 'name email role profilePicture')
            .populate({
                path: 'orderId',
                populate: { path: 'foodId', select: 'name restaurant price' }
            });

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id;

        await Message.updateMany(
            {
                conversationId,
                receiver: userId,
                isRead: false
            },
            {
                isRead: true,
                readAt: new Date()
            }
        );

        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user._id;

        const count = await Message.countDocuments({
            receiver: userId,
            isRead: false
        });

        res.json({ count });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ error: 'Failed to fetch unread count' });
    }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Only sender can delete their message
        if (!message.sender.equals(userId)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await Message.findByIdAndDelete(messageId);

        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
};

// Get users to start conversation with (based on orders)
exports.getAvailableContacts = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;

        let contacts = [];

        if (userRole === 'customer') {
            // Get merchants and drivers from user's orders
            const orders = await Order.find({ createdBy: userId })
                .populate('merchantId', 'name email role restaurantName')
                .populate('driverId', 'name email role');

            const merchantIds = new Set();
            const driverIds = new Set();

            orders.forEach(order => {
                if (order.merchantId && !merchantIds.has(order.merchantId._id.toString())) {
                    merchantIds.add(order.merchantId._id.toString());
                    contacts.push(order.merchantId);
                }
                if (order.driverId && !driverIds.has(order.driverId._id.toString())) {
                    driverIds.add(order.driverId._id.toString());
                    contacts.push(order.driverId);
                }
            });
        } else if (userRole === 'merchant') {
            // Get customers from orders for this restaurant
            const orders = await Order.find({ merchantId: userId })
                .populate('createdBy', 'name email role')
                .populate('driverId', 'name email role');

            const customerIds = new Set();
            const driverIds = new Set();

            orders.forEach(order => {
                if (order.createdBy && !customerIds.has(order.createdBy._id.toString())) {
                    customerIds.add(order.createdBy._id.toString());
                    contacts.push(order.createdBy);
                }
                if (order.driverId && !driverIds.has(order.driverId._id.toString())) {
                    driverIds.add(order.driverId._id.toString());
                    contacts.push(order.driverId);
                }
            });
        } else if (userRole === 'driver') {
            // Get customers and merchants from driver's deliveries
            const orders = await Order.find({ driverId: userId })
                .populate('createdBy', 'name email role')
                .populate('merchantId', 'name email role restaurantName');

            const customerIds = new Set();
            const merchantIds = new Set();

            orders.forEach(order => {
                if (order.createdBy && !customerIds.has(order.createdBy._id.toString())) {
                    customerIds.add(order.createdBy._id.toString());
                    contacts.push(order.createdBy);
                }
                if (order.merchantId && !merchantIds.has(order.merchantId._id.toString())) {
                    merchantIds.add(order.merchantId._id.toString());
                    contacts.push(order.merchantId);
                }
            });
        } else if (userRole === 'admin') {
            // Admin can message anyone
            contacts = await User.find({ 
                _id: { $ne: userId },
                isActive: true 
            }).select('name email role restaurantName').limit(50);
        }

        res.json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
};
