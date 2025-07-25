const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Sample book data with cover images from local directory
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
    coverImage: "/images/To kill a mockingbird.jpeg",
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
    coverImage: "/images/1984.jpeg",
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
    coverImage: "/images/The great gatsby.jpeg",
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
    coverImage: "/images/pride and prejudice.jpeg",
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
    coverImage: "/images/the catcher in the rye.jpeg",
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
    coverImage: "/images/Dune.jpg",
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
    coverImage: "/images/The Lord of the Rings.jpg",
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
    coverImage: "/images/Harry Potter and the Sorcerer's Stone.jpeg",
    stock: 25
  }
];

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  genre: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tags: {
    type: DataTypes.STRING,
    allowNull: true
  },
  publishYear: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  publisher: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isbn: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pages: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'English'
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0.0,
    validate: {
      min: 0.0,
      max: 5.0
    }
  },
  coverImage: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "https://via.placeholder.com/150x200?text=No+Cover"
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true
});

const CartItem = sequelize.define('CartItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  bookId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Books',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'cancelled'),
    defaultValue: 'pending' },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending' },
  shippingAddress: {
    type: DataTypes.TEXT,
    allowNull: true },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    } }}, {
  timestamps: true
});

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Orders',
      key: 'id'
    }
  },
  bookId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Books',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

module.exports = { Book, CartItem, Order, OrderItem };
