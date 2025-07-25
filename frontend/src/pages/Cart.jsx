import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight,
  Book
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.orders.getCart();
      setCartItems(response.data.cartItems);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await api.orders.updateCartItem(itemId, { quantity: newQuantity });
      fetchCart();
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.orders.removeFromCart(itemId);
      fetchCart();
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const CartItem = ({ item }) => (
    <div className="flex items-center space-x-4 p-4 border-b border-beige-100 last:border-b-0">
      {/* Book Image */}
      <div className="w-16 h-20 bg-gradient-to-br from-beige-100 to-rosegold-100 rounded-lg flex items-center justify-center flex-shrink-0">
        {item.book.coverImage ? (
          <img 
            src={item.book.coverImage} 
            alt={item.book.title}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <Book className="w-8 h-8 text-beige-400" />
        )}
      </div>

      {/* Book Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-beige-900 truncate">{item.book.title}</h3>
        <p className="text-sm text-beige-600">by {item.book.author}</p>
        <p className="text-lg font-semibold text-rosegold-600">${item.book.price}</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="p-1 rounded-lg hover:bg-beige-100 transition-colors"
          disabled={item.quantity <= 1}
        >
          <Minus className="w-4 h-4 text-beige-600" />
        </button>
        
        <span className="w-8 text-center font-medium text-beige-900">
          {item.quantity}
        </span>
        
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="p-1 rounded-lg hover:bg-beige-100 transition-colors"
        >
          <Plus className="w-4 h-4 text-beige-600" />
        </button>
      </div>

      {/* Total Price */}
      <div className="text-right">
        <p className="font-semibold text-beige-900">
          ${(parseFloat(item.book.price) * item.quantity).toFixed(2)}
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => removeItem(item.id)}
        className="p-2 text-beige-400 hover:text-red-500 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rosegold-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-beige-900">Shopping Cart</h1>
          <p className="text-beige-600">Review your selected books</p>
        </div>
        
        <Link to="/books" className="btn-secondary inline-flex items-center">
          Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="card-dreamy">
            {cartItems.length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingCart className="w-16 h-16 text-beige-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-beige-600 mb-2">Your cart is empty</h3>
                <p className="text-beige-500 mb-4">Add some books to get started</p>
                <Link to="/books" className="btn-primary">
                  Browse Books
                </Link>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-beige-100">
                  <h2 className="text-lg font-semibold text-beige-900">
                    Cart Items ({cartItems.length})
                  </h2>
                </div>
                
                <div>
                  {cartItems.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Order Summary */}
        {cartItems.length > 0 && (
          <div className="card-dreamy p-6 h-fit">
            <h2 className="text-lg font-semibold text-beige-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-beige-700">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-beige-700">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              
              <div className="flex justify-between text-beige-700">
                <span>Tax</span>
                <span>${(total * 0.08).toFixed(2)}</span>
              </div>
              
              <div className="border-t border-beige-200 pt-3">
                <div className="flex justify-between text-lg font-semibold text-beige-900">
                  <span>Total</span>
                  <span>${(total * 1.08).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Link 
              to="/checkout" 
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="mt-4 text-center">
              <p className="text-xs text-beige-500">
                Secure checkout powered by our payment system
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
