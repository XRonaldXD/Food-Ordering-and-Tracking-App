const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food',
        required: true
    },
    merchantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'rejected', 'cancelled'],
        default: 'pending'
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    totalAmount: {
        type: Number,
        required: false
    },
    notes: {
        type: String,
        required: false
    },
    customerNotes: {
        type: String,
        required: false
    },
    merchantNotes: {
        type: String,
        required: false
    },
    rejectionReason: {
        type: String,
        required: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    acceptedAt: {
        type: Date,
        required: false
    },
    readyAt: {
        type: Date,
        required: false
    },
    pickedUpAt: {
        type: Date,
        required: false
    },
    deliveredAt: {
        type: Date,
        required: false
    },
    deliveryAddress: {
        type: String,
        required: false
    },
    customerPhone: {
        type: String,
        required: false
    },
    driverLocation: {
        latitude: {
            type: Number,
            required: false
        },
        longitude: {
            type: Number,
            required: false
        },
        lastUpdated: {
            type: Date,
            required: false
        }
    },
    deliveryLocation: {
        latitude: {
            type: Number,
            required: false
        },
        longitude: {
            type: Number,
            required: false
        },
        address: {
            type: String,
            required: false
        }
    },
    estimatedDeliveryTime: {
        type: Date,
        required: false
    },
    statusHistory: [{
        status: String,
        timestamp: Date,
        updatedBy: String,
        notes: String
    }]
},
{ timestamps: true });



const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
