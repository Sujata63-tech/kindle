const { sequelize } = require('./config/database');
const { seedDatabase } = require('./seeders/index');

// Import models to ensure associations are set up
require('./models/index');

const resetWithLocalImages = async () => {
  try {
    console.log('🔄 Resetting database with local images...');
    
    // Force sync to recreate tables
    await sequelize.sync({ force: true });
    console.log('✅ Database tables recreated');
    
    // Seed with data that uses local images
    await seedDatabase();
    console.log('✅ Database seeded with local cover images');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
};

resetWithLocalImages();
