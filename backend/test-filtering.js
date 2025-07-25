const axios = require('axios');

const baseURL = 'http://localhost:5000';

async function testFiltering() {
  try {
    console.log('Testing Book Store Filtering...\n');
    
    // Test 1: Get all books
    console.log('1. Testing basic book retrieval:');
    const allBooks = await axios.get(`${baseURL}/api/orders/books`, {
      headers: { Authorization: 'Bearer test-token' }
    });
    console.log(`   Found ${allBooks.data.books.length} books`);
    if (allBooks.data.stats) {
      console.log(`   Categories: ${allBooks.data.stats.categories.join(', ')}`);
      console.log(`   Genres: ${allBooks.data.stats.genres.join(', ')}`);
    }
    
    // Test 2: Search by title
    console.log('\n2. Testing title search (case-insensitive):');
    const titleSearch = await axios.get(`${baseURL}/api/orders/books?title=gatsby`, {
      headers: { Authorization: 'Bearer test-token' }
    });
    console.log(`   Found ${titleSearch.data.books.length} books with 'gatsby' in title`);
    
    // Test 3: Search by author
    console.log('\n3. Testing author search:');
    const authorSearch = await axios.get(`${baseURL}/api/orders/books?author=orwell`, {
      headers: { Authorization: 'Bearer test-token' }
    });
    console.log(`   Found ${authorSearch.data.books.length} books by 'orwell'`);
    
    // Test 4: Global search
    console.log('\n4. Testing global search:');
    const globalSearch = await axios.get(`${baseURL}/api/orders/books?search=classic`, {
      headers: { Authorization: 'Bearer test-token' }
    });
    console.log(`   Found ${globalSearch.data.books.length} books matching 'classic'`);
    
    // Test 5: Price range
    console.log('\n5. Testing price range:');
    const priceRange = await axios.get(`${baseURL}/api/orders/books?minPrice=10&maxPrice=15`, {
      headers: { Authorization: 'Bearer test-token' }
    });
    console.log(`   Found ${priceRange.data.books.length} books between $10-$15`);
    
    console.log('\n✅ Book filtering tests completed!\n');
    
    console.log('Testing Poetry Filtering...\n');
    
    // Test Poetry basic retrieval
    console.log('1. Testing basic poetry retrieval:');
    const allPoetry = await axios.get(`${baseURL}/api/poetry`, {
      headers: { Authorization: 'Bearer test-token' }
    });
    console.log(`   Found ${allPoetry.data.poems.length} poems`);
    if (allPoetry.data.stats) {
      console.log(`   Categories: ${allPoetry.data.stats.categories.join(', ')}`);
    }
    
    console.log('\n✅ Poetry filtering tests completed!');
    
  } catch (error) {
    console.error('Error testing filtering:', error.response?.data || error.message);
  }
}

testFiltering();
