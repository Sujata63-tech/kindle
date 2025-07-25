import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  // Log when isAuthenticated changes
  useEffect(() => {
    console.log('AuthContext: isAuthenticated changed to:', isAuthenticated);
    console.log('AuthContext: Current user:', user);
  }, [isAuthenticated, user]);

  // Set up axios defaults
  useEffect(() => {
    console.log('AuthContext: Setting up axios defaults');
    if (token) {
      console.log('AuthContext: Setting Authorization header with token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('AuthContext: Current axios headers:', axios.defaults.headers.common);
    } else {
      console.log('AuthContext: No token, removing Authorization header');
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      console.log('AuthContext: Checking auth status...');
      console.log('AuthContext: Current token from localStorage:', localStorage.getItem('token'));
      
      if (token) {
        try {
          console.log('AuthContext: Token found, verifying with /api/auth/me');
          const response = await axios.get('/api/auth/me');
          console.log('AuthContext: /api/auth/me response:', response.data);
          setUser(response.data.user);
        } catch (error) {
          console.error('AuthContext: Auth check failed:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
          });
          logout();
        }
      } else {
        console.log('AuthContext: No token found in state');
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    console.log('1. Login function started');
    try {
      console.log('2. Making login request to /api/auth/login');
      const response = await axios.post('/api/auth/login', { email, password });
      console.log('3. Login response received:', response.data);
      
      if (!response.data || !response.data.token) {
        throw new Error('No token received in login response');
      }
      
      const { token: newToken, user: userData } = response.data;
      
      console.log('4. Setting token in localStorage');
      try {
        localStorage.setItem('token', newToken);
        console.log('4.1 Token set in localStorage');
      } catch (storageError) {
        console.error('Failed to set token in localStorage:', storageError);
        throw new Error('Failed to store authentication token');
      }
      
      // Update state in a single operation to avoid race conditions
      console.log('5. Updating auth state');
      try {
        // Set token first
        setToken(newToken);
        console.log('5.1 Token state updated');
        
        // Then set user data
        setUser(userData);
        console.log('5.2 User state updated');
        
        // Verify the token was set in localStorage
        const storedToken = localStorage.getItem('token');
        console.log('6. Verifying token in localStorage:', storedToken);
        
        if (storedToken !== newToken) {
          console.error('Token mismatch between state and localStorage');
          throw new Error('Failed to persist authentication token');
        }
        
        return { success: true };
      } catch (stateError) {
        console.error('State update failed:', stateError);
        // Clean up on error
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        throw stateError;
      }
    } catch (error) {
      console.error('Login error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.config?.headers
      });
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { token: newToken, user: newUser } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (updates) => {
    try {
      const response = await axios.put('/api/auth/profile', updates);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      console.error('Profile update failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Profile update failed' 
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
