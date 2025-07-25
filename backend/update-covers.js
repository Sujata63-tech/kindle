const { sequelize } = require('./config/database');
const { Book } = require('./models/index');

const updateCovers = async () => {
  try {
    console.log('🔄 Updating book cover images...');
    
    await sequelize.authenticate();
    
    // Update specific books with their correct cover images
    const updates = [
      {
        title: "To Kill a Mockingbird",
        coverImage: "https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg"
      },
      {
        title: "1984",
        coverImage: "https://covers.openlibrary.org/b/isbn/9780452284234-L.jpg"
      },
      {
        title: "The Great Gatsby",
        coverImage: "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg"
      },
      {
        title: "Pride and Prejudice",
        coverImage: "https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg"
      },
      {
        title: "The Catcher in the Rye",
        coverImage: "https://covers.openlibrary.org/b/isbn/9780316769488-L.jpg"
      },
      {
        title: "Dune",
        coverImage: "https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg"
      },
      {
        title: "The Lord of the Rings",
        coverImage: "https://covers.openlibrary.org/b/isbn/9780618346252-L.jpg"
      },
      {
        title: "Harry Potter and the Sorcerer's Stone",
        coverImage: "https://covers.openlibrary.org/b/isbn/9780747532699-L.jpg"
      }
    ];
    
    for (const update of updates) {
      const result = await Book.update(
        { coverImage: update.coverImage },
        { where: { title: update.title } }
      );
      
      if (result[0] > 0) {
        console.log(`✅ Updated cover for: ${update.title}`);
      } else {
        console.log(`⚠️  Book not found: ${update.title}`);
      }
    }
    
    console.log('🎉 All cover images updated!');
    
    // Show updated books
    const books = await Book.findAll({
      attributes: ['title', 'author', 'coverImage'],
      order: [['title', 'ASC']]
    });
    
    console.log('\n📚 Current books with cover images:');
    books.forEach((book, index) => {
      console.log(`${index + 1}. ${book.title} - ${book.coverImage}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  }
};

updateCovers();
