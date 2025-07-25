import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000';

export const api = {
 
  auth: {
    login: (credentials) => axios.post('/api/auth/login', credentials),
    register: (userData) => axios.post('/api/auth/register', userData),
    getMe: () => axios.get('/api/auth/me'),
    updateProfile: (updates) => axios.put('/api/auth/profile', updates),
  },

  
  todos: {
    getAll: (params) => axios.get('/api/todos', { params }),
    getById: (id) => axios.get(`/api/todos/${id}`),
    create: (data) => axios.post('/api/todos', data),
    update: (id, data) => axios.put(`/api/todos/${id}`, data),
    delete: (id) => axios.delete(`/api/todos/${id}`),
  },

  
  poetry: {
    getAll: (params) => axios.get('/api/poetry', { params }),
    getById: (id) => axios.get(`/api/poetry/${id}`),
    create: (data) => axios.post('/api/poetry', data),
    update: (id, data) => axios.put(`/api/poetry/${id}`, data),
    delete: (id) => axios.delete(`/api/poetry/${id}`),
    download: (id) => axios.get(`/api/poetry/${id}/download`, { responseType: 'blob' }),
  },

  
  chat: {
    getUsers: () => axios.get('/api/chat/users'),
    getHistory: (userId) => axios.get(`/api/chat/history/${userId}`),
    sendMessage: (data) => axios.post('/api/chat/send', data),
    getUnreadCount: () => axios.get('/api/chat/unread'),
    getConversations: () => axios.get('/api/chat/conversations'),
  },

  
  orders: {
    getBooks: (params) => axios.get('/api/orders/books', { params }),
    getBook: (id) => axios.get(`/api/orders/books/${id}`),
    getCart: () => axios.get('/api/orders/cart'),
    addToCart: (data) => axios.post('/api/orders/cart', data),
    updateCartItem: (id, data) => axios.put(`/api/orders/cart/${id}`, data),
    removeFromCart: (id) => axios.delete(`/api/orders/cart/${id}`),
    checkout: (data) => axios.post('/api/orders/checkout', data),
    getOrders: () => axios.get('/api/orders'),
    getOrder: (id) => axios.get(`/api/orders/${id}`),
  },

  
  dashboard: {
    getStats: () => axios.get('/api/dashboard/stats'),
    getActivity: (params) => axios.get('/api/dashboard/activity', { params }),
  },

 
  admin: {
    getStats: () => axios.get('/api/admin/stats'),
    getUsers: (params) => axios.get('/api/admin/users', { params }),
    updateUserRole: (id, role) => axios.put(`/api/admin/users/${id}/role`, { role }),
    deleteUser: (id) => axios.delete(`/api/admin/users/${id}`),
    getBooks: (params) => axios.get('/api/admin/books', { params }),
    createBook: (data) => axios.post('/api/admin/books', data),
    updateBook: (id, data) => axios.put(`/api/admin/books/${id}`, data),
    deleteBook: (id) => axios.delete(`/api/admin/books/${id}`),
    getOrders: (params) => axios.get('/api/admin/orders', { params }),
    updateOrderStatus: (id, status) => axios.put(`/api/admin/orders/${id}/status`, { status }),
    updateLocalCovers: () => axios.post('/api/admin/update-local-covers'),
  },
};

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Error Interceptor:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
      headers: error.config?.headers
    });

    if (error.response?.status === 401) {
      console.log('401 Unauthorized - Removing token and redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
