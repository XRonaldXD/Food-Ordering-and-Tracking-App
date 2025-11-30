const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food',
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'preparing', 'delivered', 'cancelled'],
        default: 'pending'
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    notes: {
        type: String,
        required: false
    },
    createdBy: {
        type: String,
        required: true
    }
},
{ timestamps: true });



const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
