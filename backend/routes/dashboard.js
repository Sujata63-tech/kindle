const express = require('express');
const { Op } = require('sequelize');
const User = require('../models/User');
const Todo = require('../models/Todo');
const Poetry = require('../models/Poetry');
const Chat = require('../models/Chat');
const { Order } = require('../models/Order');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();


router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const totalTodos = await Todo.count({ where: { userId } });
    const completedTodos = await Todo.count({ 
      where: { userId, status: 'completed' } 
    });
    const pendingTodos = await Todo.count({ 
      where: { userId, status: 'pending' } 
    });

    const totalPoems = await Poetry.count({ where: { userId } });

    const unreadMessages = await Chat.count({
      where: { receiverId: userId, isRead: false }
    });
    const totalConversations = await Chat.count({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      distinct: true,
      col: 'senderId'
    });

    const totalOrders = await Order.count({ where: { userId } });
    const recentOrders = await Order.count({
      where: {
        userId,
        createdAt: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    });

    const recentTodos = await Todo.findAll({
      where: { userId },
      order: [['updatedAt', 'DESC']],
      limit: 5
    });

    const recentPoems = await Poetry.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    const recentOrdersList = await Order.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.json({
      stats: {
        todos: {
          total: totalTodos,
          completed: completedTodos,
          pending: pendingTodos,
          completionRate: totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0
        },
        poetry: {
          total: totalPoems
        },
        chat: {
          unreadMessages,
          totalConversations
        },
        orders: {
          total: totalOrders,
          recent: recentOrders
        }
      },
      recentActivity: {
        todos: recentTodos,
        poems: recentPoems,
        orders: recentOrdersList
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get dashboard stats', error: error.message });
  }
});

router.get('/activity', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const activities = [];

  
    const todos = await Todo.findAll({
      where: { userId },
      order: [['updatedAt', 'DESC']],
      limit: Math.ceil(limit / 3) 
    });

    todos.forEach(todo => {
      activities.push({
        type: 'todo',
        action: todo.status === 'completed' ? 'completed' : 'updated',
        title: todo.title,
        timestamp: todo.updatedAt,
        data: todo
      });
    });

    const poems = await Poetry.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: Math.ceil(limit / 3)
    });

    poems.forEach(poem => {
      activities.push({
        type: 'poetry',
        action: 'created',
        title: poem.title,
        timestamp: poem.createdAt,
        data: poem
      });
    });

    try {
      const Order = require('../models/Order').Order;
      if (Order) {
        const orders = await Order.findAll({
          where: { userId },
          order: [['createdAt', 'DESC']],
          limit: Math.ceil(limit / 3)
        });

        orders.forEach(order => {
          activities.push({
            type: 'order',
            action: 'placed',
            title: `Order ${order.orderNumber || order.id}`,
            timestamp: order.createdAt,
            data: order
          });
        });
      }
    } catch (orderError) {
      console.warn('Order model not available, skipping order activities:', orderError.message);
    }

  
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({ 
      activities: activities.slice(0, limit) 
    });
  } catch (error) {
    console.error('Error in /activity endpoint:', error);
    res.status(500).json({ 
      message: 'Failed to get activity timeline', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
