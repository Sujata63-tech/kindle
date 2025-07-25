const { sequelize } = require('./config/database');
const { Book } = require('./models/index');

const debugBooks = async () => {
  try {
    await sequelize.authenticate();
    console.log('🔍 Checking books in database...');
    
    const books = await Book.findAll({
      order: [['title', 'ASC']],
      limit: 10
    });
    
    console.log(`Found ${books.length} books:`);
    books.forEach((book, index) => {
      console.log(`\n${index + 1}. ${book.title} by ${book.author}`);
      console.log(`   Cover Image: ${book.coverImage}`);
      console.log(`   Full URL: http://localhost:5000${book.coverImage}`);
      console.log(`   Stock: ${book.stock} | Price: $${book.price}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  }
};

debugBooks();
