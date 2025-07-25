const express = require('express');
const { body, validationResult } = require('express-validator');
const Todo = require('../models/Todo');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all todos for user with filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, priority } = req.query;
    const where = { userId: req.user.id };
    
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const todos = await Todo.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json({ todos });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get todos', error: error.message });
  }
});

// Get single todo
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const todo = await Todo.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json({ todo });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get todo', error: error.message });
  }
});

// Create todo
router.post('/', authenticateToken, [
  body('title').isLength({ min: 1 }).trim().escape(),
  body('description').optional().trim().escape(),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('dueDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { title, description, priority, dueDate } = req.body;
    
    const todo = await Todo.create({
      title,
      description,
      priority,
      dueDate,
      userId: req.user.id
    });

    res.status(201).json({ 
      message: 'Todo created successfully', 
      todo 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create todo', error: error.message });
  }
});

// Update todo
router.put('/:id', authenticateToken, [
  body('title').optional().isLength({ min: 1 }).trim().escape(),
  body('description').optional().trim().escape(),
  body('status').optional().isIn(['pending', 'completed']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('dueDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const todo = await Todo.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    await todo.update(req.body);
    
    res.json({ 
      message: 'Todo updated successfully', 
      todo 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update todo', error: error.message });
  }
});

// Delete todo
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const todo = await Todo.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    await todo.destroy();
    
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete todo', error: error.message });
  }
});

module.exports = router;
