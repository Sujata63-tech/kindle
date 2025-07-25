import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Book, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login form submitted');
    setLoading(true);
    setError('');

    try {
      console.log('1. Calling login with email:', formData.email);
      const result = await login(formData.email, formData.password);
      console.log('2. Login result:', result);
      
      if (result.success) {
        console.log('3. Login successful, navigating to /dashboard');
        setTimeout(() => {
          console.log('4. Navigating to dashboard');
          navigate('/dashboard');
        }, 100);
      } else {
        console.error('Login failed:', result.message);
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      console.error('Unexpected error during login:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError('An unexpected error occurred');
    } finally {
      console.log('Login process completed, setting loading to false');
      setLoading(false);
      
      // Log current auth state after login attempt
      console.log('Current token from localStorage:', localStorage.getItem('token'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-rosegold-500 to-beige-500 rounded-2xl mb-4 shadow-dreamy">
            <Book className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-gradient mb-2">
            Welcome Back
          </h1>
          <p className="text-beige-600">
            Sign in to your Online Kindle account
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="card-dreamy p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-beige-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-beige-400" />
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-dreamy pl-10"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-beige-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-beige-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input-dreamy pl-10 pr-10"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-beige-400 hover:text-beige-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-rosegold-500 border-beige-300 rounded focus:ring-rosegold-200 focus:ring-2"
              />
              <span className="ml-2 text-sm text-beige-600">Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-rosegold-600 hover:text-rosegold-700 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Demo Accounts */}
          <div className="border-t border-beige-100 pt-6">
            <p className="text-sm text-beige-600 text-center mb-4">Demo Accounts:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ email: 'admin@kindle.com', password: 'admin123' })}
                className="text-xs bg-beige-100 hover:bg-beige-200 text-beige-700 py-2 px-3 rounded-lg transition-colors"
              >
                Admin Login
              </button>
              <button
                type="button"
                onClick={() => setFormData({ email: 'user@kindle.com', password: 'user123' })}
                className="text-xs bg-beige-100 hover:bg-beige-200 text-beige-700 py-2 px-3 rounded-lg transition-colors"
              >
                User Login
              </button>
            </div>
          </div>
        </form>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-beige-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-rosegold-600 hover:text-rosegold-700 font-medium transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
