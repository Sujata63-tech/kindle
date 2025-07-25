const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./config/database');
const { seedDatabase } = require('./seeders/index');

require('./models/index');

const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');
const poetryRoutes = require('./routes/poetry');
const chatRoutes = require('./routes/chat');
const orderRoutes = require('./routes/orders');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/local-images', express.static(path.join(__dirname, 'images')));


app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/poetry', poetryRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : {} 
  });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    await sequelize.sync({ force: false });
    console.log('Database synchronized');

    // Seed database with initial data (non-blocking)
    seedDatabase().catch(error => {
      console.error('Seeding failed, but server will continue:', error.message);
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API Documentation available at http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
