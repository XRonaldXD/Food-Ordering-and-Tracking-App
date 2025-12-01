const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    restaurant: {
        type: String, // Store restaurant name to ensure all items are from same restaurant
        default: null
    },
    items: [{
        foodId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Food',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        notes: String
    }],
    subtotal: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    deliveryFee: {
        type: Number,
        default: 5.00
    },
    total: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
    // Calculate subtotal
    this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate tax (8%)
    this.tax = this.subtotal * 0.08;
    
    // Calculate total
    this.total = this.subtotal + this.tax + this.deliveryFee;
    
    next();
});

module.exports = mongoose.model('Cart', cartSchema);
