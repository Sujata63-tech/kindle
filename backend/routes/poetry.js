const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const Poetry = require('../models/Poetry');
const { authenticateToken } = require('../middleware/auth');
const { upload } = require('../config/multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Get all poems with comprehensive filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      author,
      category,
      tags,
      content,
      userId,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search
    } = req.query;

    const where = {};
    const searchConditions = [];

    // Basic filters (case-insensitive for SQLite)
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
    if (content) {
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push(sequelize.where(sequelize.fn('LOWER', sequelize.col('content')), 'LIKE', `%${content.toLowerCase()}%`));
    }
    if (userId) {
      where.userId = userId;
    }

    // Tags filtering - support multiple tags
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      const tagConditions = tagArray.map(tag =>
        sequelize.where(sequelize.fn('LOWER', sequelize.col('tags')), 'LIKE', `%${tag}%`)
      );
      where[Op.or] = [...(where[Op.or] || []), ...tagConditions];
    }

    // Date range filtering
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt[Op.lte] = new Date(dateTo);
      }
    }

    // Global search across multiple fields
    if (search) {
      const searchTerm = search.toLowerCase();
      const globalSearch = {
        [Op.or]: [
          sequelize.where(sequelize.fn('LOWER', sequelize.col('title')), 'LIKE', `%${searchTerm}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('author')), 'LIKE', `%${searchTerm}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('content')), 'LIKE', `%${searchTerm}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('category')), 'LIKE', `%${searchTerm}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('tags')), 'LIKE', `%${searchTerm}%`)
        ]
      };

      if (Object.keys(where).length > 0) {
        where[Op.and] = [where, globalSearch];
      } else {
        Object.assign(where, globalSearch);
      }
    }

    // Validate sort parameters
    const validSortFields = ['title', 'author', 'category', 'createdAt', 'updatedAt'];
    const validSortOrders = ['ASC', 'DESC'];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const poems = await Poetry.findAll({
      where,
      include: [{
        model: require('../models/User'),
        as: 'user',
        attributes: ['id', 'username']
      }],
      order: [[finalSortBy, finalSortOrder]]
    });

    // Get category and tag statistics for frontend
    const stats = {
      total: poems.length,
      categories: [...new Set(poems.map(p => p.category).filter(Boolean))],
      popularTags: [...new Set(
        poems
          .map(p => p.tags)
          .filter(Boolean)
          .join(',')
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
      )].slice(0, 20) // Top 20 most used tags
    };

    res.json({ poems, stats });
  } catch (error) {
    console.error('Poetry filtering error:', error);
    res.status(500).json({ message: 'Failed to get poems', error: error.message });
  }
});

// Get single poem
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const poem = await Poetry.findByPk(req.params.id, {
      include: [{
        model: require('../models/User'),
        as: 'user',
        attributes: ['id', 'username']
      }]
    });

    if (!poem) {
      return res.status(404).json({ message: 'Poem not found' });
    }

    res.json({ poem });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get poem', error: error.message });
  }
});

// Create poem with file upload
router.post('/', authenticateToken, upload.single('file'), [
  body('title').isLength({ min: 1 }).trim().escape(),
  body('author').isLength({ min: 1 }).trim().escape(),
  body('content').optional().trim(),
  body('category').optional().trim().escape(),
  body('tags').optional().trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { title, author, content, category, tags } = req.body;
    
    const poemData = {
      title,
      author,
      content,
      category,
      tags,
      userId: req.user.id
    };

    // Add file information if uploaded
    if (req.file) {
      poemData.filePath = req.file.path;
      poemData.fileName = req.file.originalname;
      poemData.mimeType = req.file.mimetype;
    }

    const poem = await Poetry.create(poemData);

    res.status(201).json({ 
      message: 'Poem created successfully', 
      poem 
    });
  } catch (error) {
    // Clean up uploaded file if creation fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Failed to create poem', error: error.message });
  }
});

// Update poem
router.put('/:id', authenticateToken, [
  body('title').optional().isLength({ min: 1 }).trim().escape(),
  body('author').optional().isLength({ min: 1 }).trim().escape(),
  body('content').optional().trim(),
  body('category').optional().trim().escape(),
  body('tags').optional().trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const poem = await Poetry.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!poem) {
      return res.status(404).json({ message: 'Poem not found' });
    }

    await poem.update(req.body);
    
    res.json({ 
      message: 'Poem updated successfully', 
      poem 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update poem', error: error.message });
  }
});

// Delete poem
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const poem = await Poetry.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!poem) {
      return res.status(404).json({ message: 'Poem not found' });
    }

    if (poem.filePath && fs.existsSync(poem.filePath)) {
      fs.unlinkSync(poem.filePath);
    }

    await poem.destroy();
    
    res.json({ message: 'Poem deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete poem', error: error.message });
  }
});

// Download poem file
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const poem = await Poetry.findByPk(req.params.id);

    if (!poem || !poem.filePath) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (!fs.existsSync(poem.filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(poem.filePath, poem.fileName);
  } catch (error) {
    res.status(500).json({ message: 'Failed to download file', error: error.message });
  }
});

module.exports = router;
