const { sequelize } = require('./config/database');
const { seedDatabase } = require('./seeders/index');

const resetAndSeed = async () => {
  try {
    console.log('🔄 Resetting database...');
    
    // Force sync will drop and recreate all tables
    await sequelize.sync({ force: true });
    console.log('✅ Database reset successfully');
    
    // Re-seed with the new data
    console.log('🌱 Seeding database with custom images...');
    await seedDatabase();
    console.log('✅ Database seeded successfully with custom cover images!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Reset and seed failed:', error);
    process.exit(1);
  }
};

resetAndSeed();
