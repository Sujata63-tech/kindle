const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { Book, CartItem, Order, OrderItem } = require('../models/Order');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all books with comprehensive filtering
router.get('/books', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching books with filters:', req.query);
    const {
      title,
      author,
      category,
      genre,
      tags,
      minPrice,
      maxPrice,
      minRating,
      maxRating,
      publishYear,
      publisher,
      language,
      minPages,
      maxPages,
      sortBy = 'title',
      sortOrder = 'ASC',
      search,
      inStock = false
    } = req.query;

    const where = {};

    // Basic text filters (case-insensitive for SQLite)
    if (title) {
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push(sequelize.where(sequelize.fn('LOWER', sequelize.col('title')), 'LIKE', `%${title.toLowerCase()}%`));
    }
    if (author) {
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push(sequelize.where(sequelize.fn('LOWER', sequelize.col('author')), 'LIKE', `%${author.toLowerCase()}%`));
    }
    if (category) {
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push(sequelize.where(sequelize.fn('LOWER', sequelize.col('category')), 'LIKE', `%${category.toLowerCase()}%`));
    }
    if (genre) {
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push(sequelize.where(sequelize.fn('LOWER', sequelize.col('genre')), 'LIKE', `%${genre.toLowerCase()}%`));
    }
    if (publisher) {
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push(sequelize.where(sequelize.fn('LOWER', sequelize.col('publisher')), 'LIKE', `%${publisher.toLowerCase()}%`));
    }
    if (language && language !== 'all') {
      where.language = language;
    }

    // Tags filtering - support multiple tags
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      const tagConditions = tagArray.map(tag =>
        sequelize.where(sequelize.fn('LOWER', sequelize.col('tags')), 'LIKE', `%${tag}%`)
      );
      where[Op.or] = [...(where[Op.or] || []), ...tagConditions];
    }

    // Price range filtering
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    // Rating range filtering
    if (minRating || maxRating) {
      where.rating = {};
      if (minRating) where.rating[Op.gte] = parseFloat(minRating);
      if (maxRating) where.rating[Op.lte] = parseFloat(maxRating);
    }

    // Pages range filtering
    if (minPages || maxPages) {
      where.pages = {};
      if (minPages) where.pages[Op.gte] = parseInt(minPages);
      if (maxPages) where.pages[Op.lte] = parseInt(maxPages);
    }

    // Publication year filtering
    if (publishYear) {
      where.publishYear = parseInt(publishYear);
    }

    // Stock filtering
    if (inStock === 'true') {
      where.stock = { [Op.gt]: 0 };
    }

    // Global search across multiple fields
    if (search) {
      const searchTerm = search.toLowerCase();
      const globalSearch = {
        [Op.or]: [
          sequelize.where(sequelize.fn('LOWER', sequelize.col('title')), 'LIKE', `%${searchTerm}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('author')), 'LIKE', `%${searchTerm}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('description')), 'LIKE', `%${searchTerm}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('category')), 'LIKE', `%${searchTerm}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('genre')), 'LIKE', `%${searchTerm}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('tags')), 'LIKE', `%${searchTerm}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('publisher')), 'LIKE', `%${searchTerm}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('isbn')), 'LIKE', `%${searchTerm}%`)
        ]
      };

      if (Object.keys(where).length > 0) {
        where[Op.and] = [where, globalSearch];
      } else {
        Object.assign(where, globalSearch);
      }
    }

    // Validate sort parameters
    const validSortFields = ['title', 'author', 'price', 'rating', 'publishYear', 'createdAt', 'stock'];
    const validSortOrders = ['ASC', 'DESC'];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'title';
    const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    console.log('Database query conditions:', JSON.stringify(where, null, 2));

    const books = await Book.findAll({
      where,
      order: [[finalSortBy, finalSortOrder]],
      raw: true 
    });

    console.log('Found books:', books.length);
    if (books.length > 0) {
      console.log('Sample book:', {
        id: books[0].id,
        title: books[0].title,
        coverImage: books[0].coverImage,
        hasImage: !!books[0].coverImage
      });
    }

    // Get category, genre, and tag statistics for frontend
    const stats = {
      total: books.length,
      categories: [...new Set(books.map(b => b.category).filter(Boolean))],
      genres: [...new Set(books.map(b => b.genre).filter(Boolean))],
      publishers: [...new Set(books.map(b => b.publisher).filter(Boolean))],
      languages: [...new Set(books.map(b => b.language).filter(Boolean))],
      publicationYears: [...new Set(books.map(b => b.publishYear).filter(Boolean))].sort((a, b) => b - a),
      popularTags: [...new Set(
        books
          .map(b => b.tags)
          .filter(Boolean)
          .join(',')
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
      )].slice(0, 20), // Top 20 most used tags
      priceRange: {
        min: Math.min(...books.map(b => parseFloat(b.price))),
        max: Math.max(...books.map(b => parseFloat(b.price)))
      },
      ratingRange: {
        min: Math.min(...books.map(b => parseFloat(b.rating || 0))),
        max: Math.max(...books.map(b => parseFloat(b.rating || 0)))
      }
    };

    res.json({ books, stats });
  } catch (error) {
    console.error('Error in /books endpoint:', error);
    res.status(500).json({
      message: 'Failed to get books',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get single book
router.get('/books/:id', authenticateToken, async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ book });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get book', error: error.message });
  }
});

router.get('/cart', authenticateToken, async (req, res) => {
  try {
    const cartItems = await CartItem.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Book,
        as: 'book'
      }]
    });

    const total = cartItems.reduce((sum, item) => {
      return sum + (parseFloat(item.book.price) * item.quantity);
    }, 0);

    res.json({ cartItems, total });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get cart', error: error.message });
  }
});

// Add to cart
router.post('/cart', authenticateToken, [
  body('bookId').isInt(),
  body('quantity').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }
    const { bookId, quantity = 1 } = req.body;
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    const existingItem = await CartItem.findOne({
      where: { userId: req.user.id, bookId }
    });
    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
    } else {
      await CartItem.create({
        userId: req.user.id,
        bookId,
        quantity
      });
    }
    res.json({ message: 'Item added to cart successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add to cart', error: error.message });
  }
});


router.put('/cart/:id', authenticateToken, [
  body('quantity').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const cartItem = await CartItem.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    cartItem.quantity = req.body.quantity;
    await cartItem.save();

    res.json({ message: 'Cart updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update cart', error: error.message });
  }
});

// Remove from cart
router.delete('/cart/:id', authenticateToken, async (req, res) => {
  try {
    const cartItem = await CartItem.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await cartItem.destroy();
    
    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove from cart', error: error.message });
  }
});

// Create order (checkout)
router.post('/checkout', authenticateToken, [
  body('paymentMethod').isLength({ min: 1 }).trim(),
  body('shippingAddress').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { paymentMethod, shippingAddress } = req.body;

    // Get cart items
    const cartItems = await CartItem.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Book,
        as: 'book'
      }]
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + (parseFloat(item.book.price) * item.quantity);
    }, 0);

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const order = await Order.create({
      orderNumber,
      totalAmount,
      paymentMethod,
      paymentStatus: 'completed', 
      shippingAddress,
      userId: req.user.id,
      status: 'processing'
    });

    // Create order items
    for (const cartItem of cartItems) {
      await OrderItem.create({
        orderId: order.id,
        bookId: cartItem.bookId,
        quantity: cartItem.quantity,
        price: cartItem.book.price
      });
    }

    // Clear cart
    await CartItem.destroy({
      where: { userId: req.user.id }
    });

    res.status(201).json({ 
      message: 'Order placed successfully', 
      order: {
        ...order.toJSON(),
        orderNumber
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
});

// Get user orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Book,
          as: 'book'
        }]
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get orders', error: error.message });
  }
});

// Get single order with receipt
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Book,
          as: 'book'
        }]
      }]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get order', error: error.message });
  }
});

// Test endpoint to verify book data
router.get('/test-books', async (req, res) => {
  try {
    const books = await Book.findAll({
      attributes: ['id', 'title', 'coverImage'],
      raw: true
    });
    
    // Log the first book's details
    if (books.length > 0) {
      console.log('First book from database:', {
        id: books[0].id,
        title: books[0].title,
        coverImage: books[0].coverImage,
        hasImage: !!books[0].coverImage
      });
    }
    
    res.json({
      message: `Found ${books.length} books`,
      books: books.slice(0, 3) // Return first 3 books to check
    });
  } catch (error) {
    console.error('Error in /test-books:', error);
    res.status(500).json({ 
      message: 'Failed to get test books', 
      error: error.message 
    });
  }
});

module.exports = router;
