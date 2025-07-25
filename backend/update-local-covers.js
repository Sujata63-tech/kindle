const { Book } = require('./models/index');

const updateBookCovers = async () => {
  try {
    console.log('🔄 Updating book cover images to use local images...');
    
    // Map book titles to their corresponding image files
    const coverImageMap = {
      "To Kill a Mockingbird": "/images/To kill a mockingbird.jpeg",
      "1984": "/images/1984.jpeg", 
      "The Great Gatsby": "/images/The great gatsby.jpeg",
      "Pride and Prejudice": "/images/pride and prejudice.jpeg",
      "The Catcher in the Rye": "/images/the catcher in the rye.jpeg",
      "Dune": "/images/Dune.jpg",
      "The Lord of the Rings": "/images/The Lord of the Rings.jpg",
      "Harry Potter and the Sorcerer's Stone": "/images/Harry Potter and the Sorcerer's Stone.jpeg"
    };

    // Update each book with its corresponding local image
    for (const [title, coverImage] of Object.entries(coverImageMap)) {
      const result = await Book.update(
        { coverImage },
        { where: { title } }
      );
      
      if (result[0] > 0) {
        console.log(`✅ Updated "${title}" with local cover image`);
      } else {
        console.log(`⚠️  Book "${title}" not found in database`);
      }
    }
    
    console.log('🎉 All local cover images updated!');
    
    // Show current books with their cover images
    const books = await Book.findAll({
      attributes: ['title', 'author', 'coverImage'],
      order: [['title', 'ASC']]
    });
    
    console.log('\n📚 Current books with local cover images:');
    books.forEach((book, index) => {
      console.log(`${index + 1}. ${book.title} - ${book.coverImage}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating cover images:', error);
    process.exit(1);
  }
};

updateBookCovers();
