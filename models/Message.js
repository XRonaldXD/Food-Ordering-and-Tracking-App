const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: String,
        required: true,
        index: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: false
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true,
        maxlength: 1000
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        required: false
    },
    attachmentUrl: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

// Index for quick conversation retrieval
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1 });

// Helper method to generate conversation ID between two users
messageSchema.statics.getConversationId = function(userId1, userId2) {
    const ids = [userId1.toString(), userId2.toString()].sort();
    return `${ids[0]}_${ids[1]}`;
};

module.exports = mongoose.model('Message', messageSchema);
