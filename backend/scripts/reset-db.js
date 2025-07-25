const { sequelize } = require('../config/database');
const { Book, CartItem, Order, OrderItem } = require('../models/Order');

async function resetDatabase() {
  try {
    console.log('Starting database reset...');
    
    // Sync all models, force: true will drop the table if it already exists
    await sequelize.sync({ force: true });
    console.log('Database schema synchronized');
    
    // Re-import the models to ensure they're registered
    await require('../models/index');
    
    console.log('Database reset complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();
