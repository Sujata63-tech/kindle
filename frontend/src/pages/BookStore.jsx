import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Star,
  Book,
  Plus,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

const BookStore = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    categories: [],
    genres: [],
    publishers: [],
    languages: [],
    popularTags: [],
    publicationYears: [],
    priceRange: { min: 0, max: 100 },
    ratingRange: { min: 0, max: 5 }
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    title: '',
    author: '',
    category: '',
    genre: '',
    tags: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    maxRating: '',
    publishYear: '',
    publisher: '',
    language: '',
    minPages: '',
    maxPages: '',
    sortBy: 'title',
    sortOrder: 'ASC',
    search: '',
    inStock: false
  });
  const [debounceTimer, setDebounceTimer] = useState(null);

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.orders.getBooks();
      const booksData = response.data;

      if (booksData.stats) {
        setStats(booksData.stats);
        setCategories(booksData.stats.categories);
      } else {
        // Fallback for backward compatibility
        const uniqueCategories = [...new Set(booksData.books.map(book => book.category).filter(Boolean))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const debounceFetchBooks = (newFilters) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    const timer = setTimeout(() => {
      fetchBooks(newFilters);
    }, 300);
    
    setDebounceTimer(timer);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (key === 'category') {
      fetchBooks(newFilters);
    } else {
      debounceFetchBooks(newFilters);
    }
  };

  const fetchBooks = async (appliedFilters = filters) => {
    try {
      setLoading(true);
      const params = {};

      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value && value.toString().trim() && value !== 'false') params[key] = value;
      });

      console.log('Fetching books with params:', params);
      const response = await api.orders.getBooks(params);

      if (response.data.books) {
        setBooks(response.data.books);
      }
      if (response.data.stats) {
        setStats(response.data.stats);
        setCategories(response.data.stats.categories);
      }
    } catch (error) {
      console.error('Failed to fetch books:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    const resetFilters = {
      title: '',
      author: '',
      category: '',
      genre: '',
      tags: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      maxRating: '',
      publishYear: '',
      publisher: '',
      language: '',
      minPages: '',
      maxPages: '',
      sortBy: 'title',
      sortOrder: 'ASC',
      search: '',
      inStock: false
    };

    setFilters(resetFilters);
    setShowAdvancedFilters(false);
    fetchBooks(resetFilters);
  };

  const addToCart = async (bookId) => {
    try {
      await api.orders.addToCart({ bookId, quantity: 1 });
      alert('Book added to cart successfully!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add book to cart');
    }
  };

  const getImageUrl = (coverImage) => {
    if (!coverImage) return 'https://via.placeholder.com/300x400?text=No+Cover';

    // If it's already a full URL (starts with http), return as is
    if (coverImage.startsWith('http')) return coverImage;

    // If it's a local path, construct the full URL pointing to backend
    return `http://localhost:5000${coverImage}`;
  };

  const BookCard = ({ book }) => (
    <div className="card-dreamy group hover:shadow-elegant transition-all duration-300 overflow-hidden h-full flex flex-col">
      {/* Book Cover */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-beige-50 to-rosegold-50">
        <img
          src={getImageUrl(book.coverImage)}
          alt={`Cover of ${book.title}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/300x400?text=No+Cover';
            console.warn(`Failed to load cover for: ${book.title}`);
          }}
        />
        
        {/* Rating Badge */}
        {book.rating > 0 && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span className="text-xs font-medium text-beige-700">{book.rating}</span>
            </div>
          </div>
        )}
        
        {/* Stock Status */}
        {book.stock <= 0 && (
          <div className="absolute top-2 left-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
            Out of Stock
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-3 flex-grow">
          <h3 className="font-serif text-lg font-semibold text-beige-900 mb-1 line-clamp-2">
            {book.title}
          </h3>
          <p className="text-sm text-beige-600 mb-2">by {book.author}</p>

          <div className="flex flex-wrap gap-1 mb-2">
            {book.category && (
              <span className="inline-block px-2 py-1 bg-beige-100 text-beige-700 text-xs rounded-full">
                {book.category}
              </span>
            )}
            {book.genre && book.genre !== book.category && (
              <span className="inline-block px-2 py-1 bg-rosegold-100 text-rosegold-700 text-xs rounded-full">
                {book.genre}
              </span>
            )}
          </div>

          {book.publishYear && (
            <p className="text-xs text-beige-500 mb-1">
              Published: {book.publishYear}
              {book.publisher && ` by ${book.publisher}`}
            </p>
          )}

          {book.pages && (
            <p className="text-xs text-beige-500 mb-2">
              {book.pages} pages
              {book.language && book.language !== 'English' && ` • ${book.language}`}
            </p>
          )}

          {book.description && (
            <p className="text-sm text-beige-600 line-clamp-3 mb-3">
              {book.description}
            </p>
          )}

          {book.tags && (
            <div className="mb-2">
              <div className="flex flex-wrap gap-1">
                {book.tags.split(',').slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-1 py-0.5 bg-cream-100 text-cream-700 text-xs rounded"
                  >
                    #{tag.trim()}
                  </span>
                ))}
                {book.tags.split(',').length > 3 && (
                  <span className="text-xs text-beige-400">+{book.tags.split(',').length - 3} more</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-xl font-bold text-rosegold-600">
              ${parseFloat(book.price).toFixed(2)}
            </span>
            {book.stock > 0 && (
              <p className="text-xs text-beige-500">
                {book.stock} in stock
              </p>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => addToCart(book.id)}
              disabled={book.stock === 0}
              className="btn-primary p-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title={book.stock === 0 ? 'Out of stock' : 'Add to cart'}
            >
              <Plus className="w-4 h-4" />
            </button>
            <Link 
              to={`/books/${book.id}`} 
              className="btn-secondary p-2 text-sm"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-beige-900">Book Store</h1>
          <p className="text-beige-600">Discover and purchase amazing books</p>
        </div>
        
        <Link to="/cart" className="btn-primary inline-flex items-center">
          <ShoppingCart className="w-5 h-5 mr-2" />
          View Cart
        </Link>
      </div>

      {/* Filters */}
      <div className="card-dreamy p-4 mb-6">
        {/* Quick Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-beige-400" />
            <input
              type="text"
              placeholder="Global search..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input-dreamy pl-10 text-sm w-full"
            />
          </div>

          <input
            type="text"
            placeholder="Title..."
            value={filters.title}
            onChange={(e) => handleFilterChange('title', e.target.value)}
            className="input-dreamy text-sm"
          />

          <input
            type="text"
            placeholder="Author..."
            value={filters.author}
            onChange={(e) => handleFilterChange('author', e.target.value)}
            className="input-dreamy text-sm"
          />

          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="input-dreamy text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <div className="flex space-x-1">
            <input
              type="number"
              placeholder="$Min"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="input-dreamy text-sm w-full"
              min="0"
              step="0.01"
            />
            <input
              type="number"
              placeholder="$Max"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="input-dreamy text-sm w-full"
              min="0"
              step="0.01"
            />
          </div>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="btn-secondary text-sm flex items-center justify-center"
          >
            <Filter className="w-4 h-4 mr-1" />
            {showAdvancedFilters ? 'Hide' : 'More'}
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="border-t border-beige-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <select
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
                className="input-dreamy text-sm"
              >
                <option value="">All Genres</option>
                {stats.genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Tags (comma separated)..."
                value={filters.tags}
                onChange={(e) => handleFilterChange('tags', e.target.value)}
                className="input-dreamy text-sm"
              />

              <select
                value={filters.publisher}
                onChange={(e) => handleFilterChange('publisher', e.target.value)}
                className="input-dreamy text-sm"
              >
                <option value="">All Publishers</option>
                {stats.publishers.slice(0, 20).map((publisher) => (
                  <option key={publisher} value={publisher}>
                    {publisher}
                  </option>
                ))}
              </select>

              <select
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                className="input-dreamy text-sm"
              >
                <option value="">All Languages</option>
                {stats.languages.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="★Min"
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="input-dreamy text-sm flex-1"
                  min="0"
                  max="5"
                  step="0.1"
                />
                <input
                  type="number"
                  placeholder="★Max"
                  value={filters.maxRating}
                  onChange={(e) => handleFilterChange('maxRating', e.target.value)}
                  className="input-dreamy text-sm flex-1"
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>

              <select
                value={filters.publishYear}
                onChange={(e) => handleFilterChange('publishYear', e.target.value)}
                className="input-dreamy text-sm"
              >
                <option value="">Any Year</option>
                {stats.publicationYears.slice(0, 20).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min Pages"
                  value={filters.minPages}
                  onChange={(e) => handleFilterChange('minPages', e.target.value)}
                  className="input-dreamy text-sm flex-1"
                  min="0"
                />
                <input
                  type="number"
                  placeholder="Max Pages"
                  value={filters.maxPages}
                  onChange={(e) => handleFilterChange('maxPages', e.target.value)}
                  className="input-dreamy text-sm flex-1"
                  min="0"
                />
              </div>

              <div className="flex space-x-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="input-dreamy text-sm flex-1"
                >
                  <option value="title">Title</option>
                  <option value="author">Author</option>
                  <option value="price">Price</option>
                  <option value="rating">Rating</option>
                  <option value="publishYear">Year</option>
                  <option value="createdAt">Date Added</option>
                </select>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className="input-dreamy text-sm flex-1"
                >
                  <option value="ASC">↑ Asc</option>
                  <option value="DESC">↓ Desc</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={filters.inStock}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                  className="rounded border-beige-300"
                />
                <label htmlFor="inStock" className="text-sm text-beige-700">
                  In Stock Only
                </label>
              </div>
            </div>

            {/* Popular Tags */}
            {stats.popularTags && stats.popularTags.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-beige-600 mb-2">Popular tags:</p>
                <div className="flex flex-wrap gap-1">
                  {stats.popularTags.slice(0, 10).map((tag, index) => (
                    <button
                      key={index}
                      onClick={() => handleFilterChange('tags', tag)}
                      className="px-2 py-1 bg-beige-100 hover:bg-beige-200 text-beige-700 text-xs rounded transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <div className="text-sm text-beige-600">
            {stats.total !== undefined ? `${stats.total} books found` : ''}
          </div>
          <button
            onClick={clearFilters}
            className="btn-secondary text-sm"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rosegold-500 mx-auto"></div>
        </div>
      ) : books.length === 0 ? (
        <div className="card-dreamy p-8 text-center">
          <Book className="w-12 h-12 text-beige-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-beige-600 mb-2">No books found</h3>
          <p className="text-beige-500">Try adjusting your search filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookStore;
