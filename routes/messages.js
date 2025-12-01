const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Not authenticated' });
}

// Get all conversations
router.get('/conversations', isAuthenticated, messageController.getConversations);

// Get messages with specific user
router.get('/conversation/:userId', isAuthenticated, messageController.getMessages);

// Send a message
router.post('/send', isAuthenticated, messageController.sendMessage);

// Mark messages as read
router.put('/read/:conversationId', isAuthenticated, messageController.markAsRead);

// Get unread count
router.get('/unread-count', isAuthenticated, messageController.getUnreadCount);

// Delete a message
router.delete('/:messageId', isAuthenticated, messageController.deleteMessage);

// Get available contacts
router.get('/contacts', isAuthenticated, messageController.getAvailableContacts);

module.exports = router;
