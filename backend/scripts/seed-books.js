const { Book, CartItem, Order, OrderItem } = require('../models/Order');
const { sequelize } = require('../config/database');

const sampleBooks = [
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    price: 12.99,
    description: "A novel about the serious issues of rape and racial inequality, told through the eyes of a young girl in the American South.",
    category: "Classic",
    coverImage: "/images/images/To kill a mockingbird.jpeg",
    stock: 15
  },
  {
    title: "1984",
    author: "George Orwell",
    price: 10.99,
    description: "A dystopian social science fiction novel about totalitarianism, surveillance, and thought control.",
    category: "Dystopian",
    coverImage: "https://m.media-amazon.com/images/I/71kxa1-0mfL._AC_UF1000,1000_QL80_.jpg",
    stock: 20
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    price: 11.50,
    description: "A story of decadence and excess, set in the Jazz Age on Long Island.",
    category: "Classic",
    coverImage: "/images/images/The great gatsby.jpeg",
    stock: 12
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    price: 9.99,
    description: "A romantic novel that charts the emotional development of Elizabeth Bennet.",
    category: "Romance",
    coverImage: "/images/images/pride and prejudice.jpeg",
    stock: 8
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    price: 14.99,
    description: "A fantasy novel about the quest of home-loving Bilbo Baggins, the hobbit of the title.",
    category: "Fantasy",
    coverImage: "https://m.media-amazon.com/images/I/710+HcoP38L._AC_UF1000,1000_QL80_.jpg",
    stock: 18
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    price: 11.25,
    description: "A story about the protagonist's experiences in New York City in the days following his expulsion from Pencey Prep.",
    category: "Fiction",
    coverImage: "/images/images/the catcher in the rye.jpeg",
    stock: 10
  },
  {
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    price: 29.99,
    description: "An epic high-fantasy novel and one of the best-selling books ever written.",
    category: "Fantasy",
    coverImage: "/images/images/The Lord of the Rings.jpg",
    stock: 15
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    price: 9.99,
    description: "A philosophical book about a young Andalusian shepherd who yearns to travel in search of a worldly treasure.",
    category: "Fiction",
    coverImage: "https://m.media-amazon.com/images/I/71aFt4+OTOL._AC_UF1000,1000_QL80_.jpg",
    stock: 22
  },
  {
    title: "The Hunger Games",
    author: "Suzanne Collins",
    price: 10.99,
    description: "A dystopian novel set in a post-apocalyptic future where children are forced to participate in a televised death match.",
    category: "Young Adult",
    coverImage: "https://m.media-amazon.com/images/I/71WSzS6zvCL._AC_UF1000,1000_QL80_.jpg",
    stock: 17
  },
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    price: 12.99,
    description: "A dazzling novel about all the choices that go into a life well lived, from the internationally bestselling author of How To Stop Time and The Comfort Book.",
    category: "Fiction",
    coverImage: "https://m.media-amazon.com/images/I/71tbalAHYCL._AC_UF1000,1000_QL80_.jpg",
    stock: 16
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    price: 16.99,
    description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the 'spice' melange.",
    category: "Science Fiction",
    coverImage: "/images/images/Dune.jpg",
    stock: 14
  },
  {
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    price: 10.99,
    description: "For years, rumors of the 'Marsh Girl' have haunted Barkley Cove, a quiet town on the North Carolina coast. So in late 1969, when handsome Chase Andrews is found dead, the locals immediately suspect Kya Clark, the so-called Marsh Girl.",
    category: "Mystery",
    coverImage: "https://m.media-amazon.com/images/I/81O1oy0y9eL._AC_UF1000,1000_QL80_.jpg",
    stock: 15
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    price: 11.98,
    description: "No matter your goals, Atomic Habits offers a proven framework for improving--every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
    category: "Self-Help",
    coverImage: "https://m.media-amazon.com/images/I/81bGKUa1e0L._AC_UF1000,1000_QL80_.jpg",
    stock: 20
  },
  {
    title: "Harry Potter and the Sorcerer's Stone",
    author: "J.K. Rowling",
    price: 12.99,
    description: "The first novel in the Harry Potter series and Rowling's debut novel, it follows Harry Potter, a young wizard who discovers his magical heritage on his eleventh birthday.",
    category: "Fantasy",
    coverImage: "/images/images/Harry Potter and the Sorcerer's Stone.jpeg",
    stock: 25
  }
];

async function seedBooks() {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('Starting to seed books...');
    
    // Disable foreign key checks
    await sequelize.query('PRAGMA foreign_keys = OFF', { transaction });
    
    // Clear existing data in the correct order to avoid foreign key constraints
    await OrderItem.destroy({ where: {}, truncate: true, cascade: true, force: true, transaction });
    await Order.destroy({ where: {}, truncate: true, cascade: true, force: true, transaction });
    await CartItem.destroy({ where: {}, truncate: true, cascade: true, force: true, transaction });
    await Book.destroy({ where: {}, truncate: true, cascade: true, force: true, transaction });
    
    console.log('Cleared existing data');
    
    // Insert sample books
    console.log('Inserting new books...');
    const createdBooks = await Book.bulkCreate(sampleBooks, { transaction });
    console.log(`Successfully seeded ${createdBooks.length} books`);
    
    // Log the first book's details as verification
    if (createdBooks.length > 0) {
      const firstBook = await Book.findByPk(createdBooks[0].id, { transaction });
      console.log('Sample book details:', {
        id: firstBook.id,
        title: firstBook.title,
        coverImage: firstBook.coverImage,
        hasImage: !!firstBook.coverImage
      });
    }
    
    // Re-enable foreign key checks
    await sequelize.query('PRAGMA foreign_keys = ON', { transaction });
    
    // Commit the transaction
    await transaction.commit();
    
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    // If there's an error, rollback the transaction
    await transaction.rollback();
    console.error('Error seeding books:', error);
    process.exit(1);
  }
}

// Run the seed function
seedBooks()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unhandled error in seed script:', error);
    process.exit(1);
  });
