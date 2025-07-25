const { sequelize } = require('./config/database');

async function forceSync() {
  try {
    console.log('Force syncing database schema...');
    await sequelize.sync({ force: true });
    console.log('Database schema force synced successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error force syncing database:', error);
    process.exit(1);
  }
}

forceSync();
