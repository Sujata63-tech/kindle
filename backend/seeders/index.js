const { sequelize } = require('../config/database');
const { User, Book } = require('../models/index');

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Create admin user
    const adminUser = await User.findOrCreate({
      where: { email: 'admin@kindle.com' },
      defaults: {
        username: 'admin',
        email: 'admin@kindle.com',
        password: 'admin123',
        role: 'admin'
      }
    });

    console.log('Admin user created/found');

    // Create sample user
    const sampleUser = await User.findOrCreate({
      where: { email: 'user@kindle.com' },
      defaults: {
        username: 'testuser',
        email: 'user@kindle.com',
        password: 'user123',
        role: 'user'
      }
    });

    console.log('Sample user created/found');

    // Create sample books with custom cover images
    const sampleBooks = [
      {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        price: 12.99,
        description: "A novel about the serious issues of rape and racial inequality, told through the eyes of a young girl in the American South.",
        category: "Classic",
        genre: "Literature",
        tags: "classic, racism, justice, coming-of-age",
        publishYear: 1960,
        publisher: "J. B. Lippincott & Co.",
        isbn: "978-0-06-112008-4",
        pages: 281,
        language: "English",
        rating: 4.3,
        coverImage: "https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg",
        stock: 15
      },
      {
        title: "1984",
        author: "George Orwell",
        price: 10.99,
        description: "A dystopian social science fiction novel about totalitarianism, surveillance, and thought control.",
        category: "Dystopian",
        genre: "Science Fiction",
        tags: "dystopian, surveillance, totalitarianism, orwell",
        publishYear: 1949,
        publisher: "Secker & Warburg",
        isbn: "978-0-452-28423-4",
        pages: 328,
        language: "English",
        rating: 4.2,
        coverImage: "https://covers.openlibrary.org/b/isbn/9780452284234-L.jpg",
        stock: 20
      },
      {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        price: 11.50,
        description: "A story of decadence and excess, set in the Jazz Age on Long Island.",
        category: "Classic",
        genre: "Literature",
        tags: "jazz age, american dream, wealth, love",
        publishYear: 1925,
        publisher: "Charles Scribner's Sons",
        isbn: "978-0-7432-7356-5",
        pages: 180,
        language: "English",
        rating: 4.0,
        coverImage: "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg",
        stock: 10
      },
      {
        title: "Pride and Prejudice",
        author: "Jane Austen",
        price: 9.99,
        description: "A romantic novel that charts the emotional development of the protagonist Elizabeth Bennet.",
        category: "Classic",
        genre: "Romance",
        tags: "romance, marriage, society, pride",
        publishYear: 1813,
        publisher: "T. Egerton, Whitehall",
        isbn: "978-0-14-143951-8",
        pages: 279,
        language: "English",
        rating: 4.5,
        coverImage: "https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg",
        stock: 18
      },
      {
        title: "The Catcher in the Rye",
        author: "J.D. Salinger",
        price: 10.50,
        description: "A story about a few days in the life of Holden Caulfield, a young man who has been expelled from prep school.",
        category: "Fiction",
        genre: "Coming-of-age",
        tags: "coming of age, alienation, youth",
        publishYear: 1951,
        publisher: "Little, Brown and Company",
        isbn: "978-0-316-76948-0",
        pages: 234,
        language: "English",
        rating: 3.8,
        coverImage: "https://covers.openlibrary.org/b/isbn/9780316769488-L.jpg",
        stock: 12
      },
      {
        title: "Dune",
        author: "Frank Herbert",
        price: 14.99,
        description: "A science fiction novel about the son of a noble family entrusted with the protection of the most valuable asset in the galaxy.",
        category: "Science Fiction",
        genre: "Space Opera",
        tags: "sci-fi, space, politics, religion",
        publishYear: 1965,
        publisher: "Chilton Books",
        isbn: "978-0-441-17271-9",
        pages: 412,
        language: "English",
        rating: 4.7,
        coverImage: "https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg",
        stock: 8
      },
      {
        title: "The Lord of the Rings",
        author: "J.R.R. Tolkien",
        price: 19.99,
        description: "An epic high-fantasy novel about the struggle to destroy the One Ring, which was created by the Dark Lord Sauron.",
        category: "Fantasy",
        genre: "High Fantasy",
        tags: "fantasy, adventure, middle-earth, ring",
        publishYear: 1954,
        publisher: "Allen & Unwin",
        isbn: "978-0-618-34625-4",
        pages: 1178,
        language: "English",
        rating: 4.8,
        coverImage: "https://covers.openlibrary.org/b/isbn/9780618346252-L.jpg",
        stock: 5
      },
      {
        title: "Harry Potter and the Sorcerer's Stone",
        author: "J.K. Rowling",
        price: 12.99,
        description: "The first novel in the Harry Potter series about a young wizard who discovers his magical heritage.",
        category: "Fantasy",
        genre: "Children's Literature",
        tags: "magic, wizardry, hogwarts, fantasy",
        publishYear: 1997,
        publisher: "Bloomsbury",
        isbn: "978-0-7475-3269-6",
        pages: 223,
        language: "English",
        rating: 4.8,
        coverImage: "https://covers.openlibrary.org/b/isbn/9780747532699-L.jpg",
        stock: 25
      }
    ];

    for (const bookData of sampleBooks) {
      await Book.findOrCreate({
        where: { title: bookData.title, author: bookData.author },
        defaults: bookData
      });
    }

    console.log('Sample books created/found');
    console.log('Database seeding completed successfully!');

  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  }
};

module.exports = { seedDatabase };
