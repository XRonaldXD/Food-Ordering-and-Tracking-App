const Cart = require('../models/Cart');
const Food = require('../models/Food');
const Order = require('../models/Order');
const User = require('../models/User');
const systemLogger = require('../utils/systemLogger');

// Get user's cart
exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id })
            .populate('items.foodId');
        
        if (!cart) {
            return res.json({
                items: [],
                subtotal: 0,
                tax: 0,
                deliveryFee: 5.00,
                total: 5.00,
                restaurant: null
            });
        }
        
        res.json(cart);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
};

// Add item to cart
exports.addToCart = async (req, res) => {
    try {
        const { foodId, quantity, notes } = req.body;
        
        // Validate food exists
        const food = await Food.findById(foodId);
        if (!food) {
            return res.status(404).json({ error: 'Food item not found' });
        }
        
        // Get or create cart
        let cart = await Cart.findOne({ userId: req.user._id });
        
        if (!cart) {
            cart = new Cart({
                userId: req.user._id,
                restaurant: food.restaurant,
                items: []
            });
        }
        
        // Check if adding from different restaurant
        if (cart.restaurant && cart.restaurant !== food.restaurant && cart.items.length > 0) {
            return res.status(400).json({ 
                error: 'Cannot add items from different restaurants. Please clear your cart first.',
                differentRestaurant: true,
                currentRestaurant: cart.restaurant,
                newRestaurant: food.restaurant
            });
        }
        
        // Set restaurant if this is first item
        if (!cart.restaurant) {
            cart.restaurant = food.restaurant;
        }
        
        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.foodId.toString() === foodId
        );
        
        if (existingItemIndex > -1) {
            // Update quantity
            cart.items[existingItemIndex].quantity += parseInt(quantity);
            if (notes) {
                cart.items[existingItemIndex].notes = notes;
            }
        } else {
            // Add new item
            cart.items.push({
                foodId: food._id,
                quantity: parseInt(quantity),
                price: food.price,
                notes: notes || ''
            });
        }
        
        await cart.save();
        await cart.populate('items.foodId');
        
        // Send system notification for cart item added
        await systemLogger.logCartItemAdded(req.user._id, {
            foodName: food.name,
            price: food.price,
            quantity: parseInt(quantity)
        });
        
        res.json(cart);
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
};

// Update cart item
exports.updateCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity, notes } = req.body;
        
        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        
        const item = cart.items.id(itemId);
        if (!item) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }
        
        if (quantity !== undefined) {
            item.quantity = parseInt(quantity);
        }
        if (notes !== undefined) {
            item.notes = notes;
        }
        
        await cart.save();
        await cart.populate('items.foodId');
        
        res.json(cart);
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ error: 'Failed to update cart item' });
    }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;
        
        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        
        cart.items.pull(itemId);
        
        // Clear restaurant if no items left
        if (cart.items.length === 0) {
            cart.restaurant = null;
        }
        
        await cart.save();
        await cart.populate('items.foodId');
        
        res.json(cart);
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ error: 'Failed to remove item from cart' });
    }
};

// Clear cart
exports.clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            return res.json({ message: 'Cart is already empty' });
        }
        
        cart.items = [];
        cart.restaurant = null;
        await cart.save();
        
        res.json({ message: 'Cart cleared successfully' });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
};

// Checkout - create orders from cart
exports.checkout = async (req, res) => {
    try {
        const { deliveryAddress, customerPhone } = req.body;
        
        if (!deliveryAddress || !customerPhone) {
            return res.status(400).json({ error: 'Delivery address and phone are required' });
        }
        
        const cart = await Cart.findOne({ userId: req.user._id }).populate('items.foodId');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }
        
        // Group items by merchant
        const ordersByMerchant = {};
        for (const item of cart.items) {
            const merchantId = item.foodId.createdBy;
            if (!ordersByMerchant[merchantId]) {
                ordersByMerchant[merchantId] = [];
            }
            ordersByMerchant[merchantId].push(item);
        }
        
        // Create orders for each merchant
        const createdOrders = [];
        for (const [merchantId, items] of Object.entries(ordersByMerchant)) {
            for (const item of items) {
                const order = new Order({
                    foodId: item.foodId._id,
                    merchantId: merchantId,
                    createdBy: req.user._id,
                    quantity: item.quantity,
                    totalAmount: item.price * item.quantity,
                    customerNotes: item.notes || '',
                    deliveryAddress: deliveryAddress,
                    customerPhone: customerPhone,
                    status: 'pending'
                });
                await order.save();
                createdOrders.push(order);
            }
        }
        
        // Clear cart after successful checkout
        const totalAmount = cart.total;
        const restaurant = cart.restaurant;
        const orderCount = createdOrders.length;
        
        cart.items = [];
        cart.restaurant = null;
        await cart.save();
        
        // Send system notification for cart checkout
        await systemLogger.logCartCheckout(req.user._id, {
            orderCount: orderCount,
            totalAmount: totalAmount,
            restaurant: restaurant
        });
        
        res.json({ 
            message: 'Orders placed successfully',
            orders: createdOrders
        });
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).json({ error: 'Failed to complete checkout' });
    }
};

// Get cart item count
exports.getCartCount = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id });
        const count = cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
        res.json({ count });
    } catch (error) {
        console.error('Error getting cart count:', error);
        res.status(500).json({ error: 'Failed to get cart count' });
    }
};
