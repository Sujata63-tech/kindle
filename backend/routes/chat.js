const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get available users for chat
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        id: { [Op.ne]: req.user.id }
      },
      attributes: ['id', 'username', 'profileImage'],
      order: [['username', 'ASC']]
    });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get users', error: error.message });
  }
});

router.get('/history/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const messages = await Chat.findAll({
      where: {
        [Op.or]: [
          { senderId: req.user.id, receiverId: userId },
          { senderId: userId, receiverId: req.user.id }
        ]
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username'] },
        { model: User, as: 'receiver', attributes: ['id', 'username'] }
      ],
      order: [['createdAt', 'ASC']]
    });

    // Mark messages as read
    await Chat.update(
      { isRead: true },
      {
        where: {
          senderId: userId,
          receiverId: req.user.id,
          isRead: false
        }
      }
    );

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get chat history', error: error.message });
  }
});

// Send message
router.post('/send', authenticateToken, [
  body('receiverId').isInt(),
  body('message').isLength({ min: 1 }).trim(),
  body('gift').optional().trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { receiverId, message, gift } = req.body;

    // Check if receiver exists
    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const chatMessage = await Chat.create({
      senderId: req.user.id,
      receiverId,
      message,
      gift
    });

    const populatedMessage = await Chat.findByPk(chatMessage.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username'] },
        { model: User, as: 'receiver', attributes: ['id', 'username'] }
      ]
    });

    res.status(201).json({ 
      message: 'Message sent successfully', 
      chatMessage: populatedMessage 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
});

// Get unread message count
router.get('/unread', authenticateToken, async (req, res) => {
  try {
    const unreadCount = await Chat.count({
      where: {
        receiverId: req.user.id,
        isRead: false
      }
    });

    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get unread count', error: error.message });
  }
});

// Get recent conversations
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const conversations = await Chat.findAll({
      where: {
        [Op.or]: [
          { senderId: req.user.id },
          { receiverId: req.user.id }
        ]
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username'] },
        { model: User, as: 'receiver', attributes: ['id', 'username'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    // Group by conversation partner
    const conversationMap = new Map();
    
    conversations.forEach(msg => {
      const partnerId = msg.senderId === req.user.id ? msg.receiverId : msg.senderId;
      const partner = msg.senderId === req.user.id ? msg.receiver : msg.sender;
      
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partner,
          lastMessage: msg,
          unreadCount: 0
        });
      }
      
      if (msg.receiverId === req.user.id && !msg.isRead) {
        conversationMap.get(partnerId).unreadCount++;
      }
    });

    const recentConversations = Array.from(conversationMap.values());

    res.json({ conversations: recentConversations });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get conversations', error: error.message });
  }
});

module.exports = router;
