const Message = require('../models/Message');
const User = require('../models/User');

// System user ID - we'll create a dedicated system user
const SYSTEM_USER_ID = 'system';

// Get or create system user
async function getSystemUser() {
    let systemUser = await User.findOne({ email: 'system@app.internal' });
    
    if (!systemUser) {
        systemUser = new User({
            email: 'system@app.internal',
            name: 'System',
            role: 'admin',
            googleId: 'system-internal'
        });
        await systemUser.save();
    }
    
    return systemUser;
}

// Send system message to user
async function sendSystemMessage(userId, messageText, orderId = null) {
    try {
        const systemUser = await getSystemUser();
        
        const conversationId = Message.schema.statics.getConversationId(
            systemUser._id.toString(),
            userId.toString()
        );

        const message = new Message({
            conversationId,
            sender: systemUser._id,
            receiver: userId,
            message: messageText,
            orderId: orderId,
            isRead: false
        });

        await message.save();
        return message;
    } catch (error) {
        console.error('Error sending system message:', error);
    }
}

// Log order creation
async function logOrderCreated(userId, orderDetails) {
    const message = `🎉 Order Created!\n\nYou've successfully placed an order for ${orderDetails.foodName} from ${orderDetails.restaurant}.\n\nQuantity: ${orderDetails.quantity}\nTotal: $${orderDetails.totalAmount}\n\nYour order is being processed. We'll notify you when the merchant accepts it.`;
    await sendSystemMessage(userId, message, orderDetails.orderId);
}

// Log order accepted
async function logOrderAccepted(userId, orderDetails) {
    const message = `✅ Order Accepted!\n\nGreat news! Your order for ${orderDetails.foodName} has been accepted by ${orderDetails.restaurant}.\n\nThe merchant is now preparing your food. You'll receive another notification when it's ready for pickup.`;
    await sendSystemMessage(userId, message, orderDetails.orderId);
}

// Log order preparing
async function logOrderPreparing(userId, orderDetails) {
    const message = `👨‍🍳 Order is Being Prepared!\n\nYour ${orderDetails.foodName} is now being prepared by ${orderDetails.restaurant}.\n\nEstimated preparation time: 15-30 minutes.`;
    await sendSystemMessage(userId, message, orderDetails.orderId);
}

// Log order ready
async function logOrderReady(userId, orderDetails) {
    const message = `🍽️ Order Ready for Pickup!\n\nYour ${orderDetails.foodName} is ready and waiting for a driver to pick it up.\n\nWe're finding the best driver for your delivery.`;
    await sendSystemMessage(userId, message, orderDetails.orderId);
}

// Log order out for delivery
async function logOrderOutForDelivery(userId, orderDetails) {
    const message = `🚚 Order Out for Delivery!\n\nYour ${orderDetails.foodName} is on its way!\n\nDriver: ${orderDetails.driverName}\n\nYou can now track your order in real-time. Click the "Track Order" button in your profile to see live updates.`;
    await sendSystemMessage(userId, message, orderDetails.orderId);
}

// Log order delivered
async function logOrderDelivered(userId, orderDetails) {
    const message = `✨ Order Delivered!\n\nYour ${orderDetails.foodName} has been successfully delivered!\n\nWe hope you enjoy your meal. Thank you for using our service!\n\n💡 Tip: You can rate your experience in the order history.`;
    await sendSystemMessage(userId, message, orderDetails.orderId);
}

// Log order rejected
async function logOrderRejected(userId, orderDetails) {
    const message = `❌ Order Rejected\n\nUnfortunately, your order for ${orderDetails.foodName} has been rejected by ${orderDetails.restaurant}.\n\nReason: ${orderDetails.reason || 'Not specified'}\n\nYou can try ordering again or choose a different restaurant.`;
    await sendSystemMessage(userId, message, orderDetails.orderId);
}

// Log order cancelled
async function logOrderCancelled(userId, orderDetails) {
    const message = `🔄 Order Cancelled\n\nYour order for ${orderDetails.foodName} has been cancelled.\n\nIf you didn't request this cancellation, please contact support.`;
    await sendSystemMessage(userId, message, orderDetails.orderId);
}

// Log food item created
async function logFoodCreated(userId, foodDetails) {
    const message = `🍕 New Food Item Created!\n\nYou've successfully added "${foodDetails.name}" to your menu.\n\nPrice: $${foodDetails.price}\nRestaurant: ${foodDetails.restaurant}\n\nYour item is now visible to customers!`;
    await sendSystemMessage(userId, message);
}

// Log food item deleted
async function logFoodDeleted(userId, foodDetails) {
    const message = `🗑️ Food Item Removed\n\nYou've removed "${foodDetails.name}" from your menu.\n\nThis item is no longer visible to customers.`;
    await sendSystemMessage(userId, message);
}

// Log cart checkout
async function logCartCheckout(userId, cartDetails) {
    const message = `🛒 Orders Placed from Cart!\n\nYou've successfully placed ${cartDetails.orderCount} order(s) from your cart.\n\nTotal Amount: $${cartDetails.totalAmount}\nRestaurant: ${cartDetails.restaurant}\n\nYou can track all your orders in the Profile section.`;
    await sendSystemMessage(userId, message);
}

// Log cart item added
async function logCartItemAdded(userId, itemDetails) {
    const message = `➕ Item Added to Cart!\n\n${itemDetails.foodName} has been added to your cart.\n\nPrice: $${itemDetails.price}\nQuantity: ${itemDetails.quantity}\n\nGo to your cart to checkout when ready.`;
    await sendSystemMessage(userId, message);
}

// Log driver assigned
async function logDriverAssigned(userId, orderDetails) {
    const message = `👤 Driver Assigned!\n\nA driver has been assigned to your order: ${orderDetails.foodName}\n\nDriver: ${orderDetails.driverName}\n\nYour order will be picked up soon.`;
    await sendSystemMessage(userId, message, orderDetails.orderId);
}

// Log welcome message for new users
async function logWelcomeMessage(userId, userName) {
    const message = `👋 Welcome to Food Ordering & Tracking, ${userName}!\n\n🎉 Your account has been successfully created!\n\nHere's what you can do:\n• Browse restaurants and order food\n• Track your orders in real-time with GPS\n• Chat with drivers and merchants\n• Add items to cart for easy checkout\n\nNeed help? Just reply to this message!\n\nEnjoy your experience! 🍔🍕🍜`;
    await sendSystemMessage(userId, message);
}

// Log merchant order notification
async function logMerchantOrderNotification(merchantId, orderDetails) {
    const message = `🔔 New Order Received!\n\nYou have a new order for ${orderDetails.foodName}.\n\nCustomer: ${orderDetails.customerName}\nQuantity: ${orderDetails.quantity}\nAmount: $${orderDetails.totalAmount}\n\nPlease accept or reject this order in your dashboard.`;
    await sendSystemMessage(merchantId, message, orderDetails.orderId);
}

// Log driver order available
async function logDriverOrderAvailable(driverId, orderDetails) {
    const message = `🚗 New Delivery Available!\n\nA new delivery opportunity is available.\n\nRestaurant: ${orderDetails.restaurant}\nDelivery Address: ${orderDetails.deliveryAddress}\nEarnings: $${orderDetails.earnings}\n\nCheck your driver dashboard to accept this delivery!`;
    await sendSystemMessage(driverId, message, orderDetails.orderId);
}

module.exports = {
    getSystemUser,
    sendSystemMessage,
    logOrderCreated,
    logOrderAccepted,
    logOrderPreparing,
    logOrderReady,
    logOrderOutForDelivery,
    logOrderDelivered,
    logOrderRejected,
    logOrderCancelled,
    logFoodCreated,
    logFoodDeleted,
    logCartCheckout,
    logCartItemAdded,
    logDriverAssigned,
    logWelcomeMessage,
    logMerchantOrderNotification,
    logDriverOrderAvailable
};
