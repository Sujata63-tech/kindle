const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const User = require('../models/User');
const Todo = require('../models/Todo');
const Poetry = require('../models/Poetry');
const Chat = require('../models/Chat');
const { Book, Order, OrderItem } = require('../models/Order');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);


router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalTodos = await Todo.count();
    const totalPoems = await Poetry.count();
    const totalBooks = await Book.count();
    const totalOrders = await Order.count();
    const totalRevenue = await Order.sum('totalAmount', {
      where: { paymentStatus: 'completed' }
    });

    // Recent registrations (last 30 days)
    const recentUsers = await User.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    res.json({
      stats: {
        users: {
          total: totalUsers,
          recent: recentUsers
        },
        content: {
          todos: totalTodos,
          poems: totalPoems,
          books: totalBooks
        },
        orders: {
          total: totalOrders,
          revenue: totalRevenue || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get admin stats', error: error.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (search) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      users,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get users', error: error.message });
  }
});

// Update user role
router.put('/users/:id/role', [
  body('role').isIn(['user', 'admin'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ role: req.body.role });
    
    res.json({ 
      message: 'User role updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user role', error: error.message });
  }
});


router.delete('/users/:id', async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});


router.get('/books', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: books } = await Book.findAndCountAll({
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      books,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get books', error: error.message });
  }
});


router.post('/books', [
  body('title').isLength({ min: 1 }).trim().escape(),
  body('author').isLength({ min: 1 }).trim().escape(),
  body('price').isFloat({ min: 0 }),
  body('description').optional().trim(),
  body('category').optional().trim().escape(),
  body('stock').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const book = await Book.create(req.body);
    
    res.status(201).json({ 
      message: 'Book created successfully', 
      book 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create book', error: error.message });
  }
});


router.put('/books/:id', [
  body('title').optional().isLength({ min: 1 }).trim().escape(),
  body('author').optional().isLength({ min: 1 }).trim().escape(),
  body('price').optional().isFloat({ min: 0 }),
  body('description').optional().trim(),
  body('category').optional().trim().escape(),
  body('stock').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await book.update(req.body);
    
    res.json({ 
      message: 'Book updated successfully', 
      book 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update book', error: error.message });
  }
});


router.delete('/books/:id', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await book.destroy();
    
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete book', error: error.message });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (status) where.status = status;
    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email'] }, {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Book,
            as: 'book' }]
        } ],
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });
    res.json({
      orders,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get orders', error: error.message });
  }
});

// Update order status
router.put('/orders/:id/status', [
  body('status').isIn(['pending', 'processing', 'completed', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.update({ status: req.body.status });

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
});

// Update book cover images to use local images
router.post('/update-local-covers', async (req, res) => {
  try {
    console.log('🔄 Updating book cover images to use local images...');

    const coverImageMap = {
      "To Kill a Mockingbird": "/images/To kill a mockingbird.jpeg",
      "1984": "/images/1984.jpeg",
      "The Great Gatsby": "/images/The great gatsby.jpeg",
      "Pride and Prejudice": "/images/pride and prejudice.jpeg",
      "The Catcher in the Rye": "/images/the catcher in the rye.jpeg",
      "Dune": "/images/Dune.jpg",
      "The Lord of the Rings": "/images/The Lord of the Rings.jpg",
      "Harry Potter and the Sorcerer's Stone": "/images/Harry Potter and the Sorcerer's Stone.jpeg"
    };

    const results = [];

    // Update each book with its corresponding local image
    for (const [title, coverImage] of Object.entries(coverImageMap)) {
      const [affectedRows] = await Book.update(
        { coverImage },
        { where: { title } }
      );

      if (affectedRows > 0) {
        console.log(` Updated "${title}" with local cover image`);
        results.push({ title, status: 'updated', coverImage });
      } else {
        console.log(`  Book "${title}" not found in database`);
        results.push({ title, status: 'not_found', coverImage });
      }
    }

    console.log(' All local cover images updated!');

    // Show updated books with their cover images
    const books = await Book.findAll({
      attributes: ['title', 'author', 'coverImage'],
      order: [['title', 'ASC']]
    });

    res.json({
      message: 'Book cover images updated successfully',
      results,
      books: books.map(book => ({
        title: book.title,
        author: book.author,
        coverImage: book.coverImage,
        isLocal: book.coverImage && book.coverImage.startsWith('/images/')
      }))
    });
  } catch (error) {
    console.error(' Error updating cover images:', error);
    res.status(500).json({
      message: 'Failed to update cover images',
      error: error.message
    });
  }
});

module.exports = router;
