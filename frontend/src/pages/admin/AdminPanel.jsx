import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  Book, 
  ShoppingBag, 
  BarChart3,
  Settings,
  ArrowLeft
} from 'lucide-react';
import { api } from '../../utils/api';

// Admin subcomponents
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.admin.getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rosegold-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-beige-900">Admin Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-dreamy p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-beige-600">Total Users</p>
              <p className="text-2xl font-bold text-beige-900">{stats?.users?.total || 0}</p>
              <p className="text-xs text-green-600">{stats?.users?.recent || 0} new this month</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="card-dreamy p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-beige-600">Total Books</p>
              <p className="text-2xl font-bold text-beige-900">{stats?.content?.books || 0}</p>
            </div>
            <Book className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="card-dreamy p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-beige-600">Total Orders</p>
              <p className="text-2xl font-bold text-beige-900">{stats?.orders?.total || 0}</p>
            </div>
            <ShoppingBag className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="card-dreamy p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-beige-600">Revenue</p>
              <p className="text-2xl font-bold text-beige-900">${stats?.orders?.revenue?.toFixed(2) || '0.00'}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-rosegold-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.admin.getUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      await api.admin.updateUserRole(userId, role);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.admin.deleteUser(userId);
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-beige-900">User Management</h2>
      
      <div className="card-dreamy overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-beige-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-beige-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-beige-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-beige-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-beige-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rosegold-500 mx-auto"></div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-beige-900">{user.username}</div>
                        <div className="text-sm text-beige-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className="text-sm border border-beige-300 rounded px-2 py-1"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-beige-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [updatingCovers, setUpdatingCovers] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    price: '',
    description: '',
    category: '',
    stock: ''
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await api.admin.getBooks();
      setBooks(response.data.books);
    } catch (error) {
      console.error('Failed to fetch books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBook) {
        await api.admin.updateBook(editingBook.id, formData);
      } else {
        await api.admin.createBook(formData);
      }
      setShowModal(false);
      setEditingBook(null);
      setFormData({ title: '', author: '', price: '', description: '', category: '', stock: '' });
      fetchBooks();
    } catch (error) {
      console.error('Failed to save book:', error);
    }
  };

  const deleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await api.admin.deleteBook(bookId);
        fetchBooks();
      } catch (error) {
        console.error('Failed to delete book:', error);
      }
    }
  };

  const updateLocalCovers = async () => {
    if (window.confirm('This will update all book cover images to use local images. Continue?')) {
      try {
        setUpdatingCovers(true);
        const response = await api.admin.updateLocalCovers();
        alert(`Success! Updated cover images for books. Check console for details.`);
        console.log('Cover update results:', response.data);
        fetchBooks(); // Refresh the book list
      } catch (error) {
        console.error('Failed to update local covers:', error);
        alert('Failed to update cover images. Check console for details.');
      } finally {
        setUpdatingCovers(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-beige-900">Book Management</h2>
        <div className="flex space-x-3">
          <button
            onClick={updateLocalCovers}
            disabled={updatingCovers}
            className="btn-secondary flex items-center"
          >
            {updatingCovers ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Updating...
              </>
            ) : (
              'Use Local Images'
            )}
          </button>
          <button
            onClick={() => {
              setEditingBook(null);
              setFormData({ title: '', author: '', price: '', description: '', category: '', stock: '' });
              setShowModal(true);
            }}
            className="btn-primary"
          >
            Add Book
          </button>
        </div>
      </div>
      
      <div className="card-dreamy overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-beige-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-beige-500 uppercase tracking-wider">
                  Book
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-beige-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-beige-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-beige-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rosegold-500 mx-auto"></div>
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr key={book.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-beige-900">{book.title}</div>
                        <div className="text-sm text-beige-500">by {book.author}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-beige-900">
                      ${book.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-beige-900">
                      {book.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setEditingBook(book);
                          setFormData({
                            title: book.title,
                            author: book.author,
                            price: book.price,
                            description: book.description || '',
                            category: book.category || '',
                            stock: book.stock
                          });
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteBook(book.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card-dreamy w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-beige-900 mb-4">
              {editingBook ? 'Edit Book' : 'Add New Book'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="input-dreamy"
              />
              
              <input
                type="text"
                placeholder="Author"
                required
                value={formData.author}
                onChange={(e) => setFormData({...formData, author: e.target.value})}
                className="input-dreamy"
              />
              
              <input
                type="number"
                placeholder="Price"
                required
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="input-dreamy"
              />
              
              <input
                type="text"
                placeholder="Category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="input-dreamy"
              />
              
              <input
                type="number"
                placeholder="Stock"
                required
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="input-dreamy"
              />
              
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="input-dreamy h-20 resize-none"
              />
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingBook ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminPanel = () => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Books', href: '/admin/books', icon: Book },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-beige-50 to-rosegold-50">
      <div className="flex">
        {/* Admin Sidebar */}
        <div className="w-64 glass-effect border-r border-white/30 min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-8">
              <Link to="/dashboard" className="text-beige-600 hover:text-beige-800">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-beige-900">Admin Panel</h1>
            </div>
            
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-rosegold-100 text-rosegold-700'
                        : 'text-beige-600 hover:bg-beige-100 hover:text-beige-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="books" element={<BookManagement />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
