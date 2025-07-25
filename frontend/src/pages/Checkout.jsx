import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  MapPin, 
  ShoppingBag, 
  Check,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const [formData, setFormData] = useState({
    // Payment information
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    
    // Shipping information
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    
    paymentMethod: 'credit_card'
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.orders.getCart();
      setCartItems(response.data.cartItems);
      setTotal(response.data.total);
      
      if (response.data.cartItems.length === 0) {
        navigate('/cart');
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    
    // Format expiry date
    if (name === 'expiryDate') {
      const formatted = value.replace(/\D/g, '').replace(/(.{2})/, '$1/').substr(0, 5);
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const orderData = {
        paymentMethod: 'Credit Card',
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`
      };

      const response = await api.orders.checkout(orderData);
      setCompletedOrder(response.data.order);
      setOrderComplete(true);
    } catch (error) {
      console.error('Failed to process order:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rosegold-500"></div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6 fade-in">
        <div className="card-dreamy p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-serif font-bold text-beige-900 mb-2">
            Order Successful!
          </h1>
          
          <p className="text-beige-600 mb-6">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          
          <div className="bg-beige-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-beige-900 mb-2">Order Details</h3>
            <p className="text-sm text-beige-700">Order Number: {completedOrder?.orderNumber}</p>
            <p className="text-sm text-beige-700">Total: ${completedOrder?.totalAmount}</p>
            <p className="text-sm text-beige-700">
              Date: {new Date(completedOrder?.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex space-x-4 justify-center">
            <Link to="/orders" className="btn-primary">
              View Orders
            </Link>
            <Link to="/books" className="btn-secondary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/cart" className="p-2 rounded-lg hover:bg-beige-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-beige-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-serif font-bold text-beige-900">Checkout</h1>
          <p className="text-beige-600">Complete your purchase</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Information */}
            <div className="card-dreamy p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="w-5 h-5 text-beige-600" />
                <h2 className="text-lg font-semibold text-beige-900">Payment Information</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-2">
                    Card Number *
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    required
                    maxLength="19"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    className="input-dreamy"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-beige-700 mb-2">
                      Expiry Date *
                    </label>
                    <input
                      type="text"
                      name="expiryDate"
                      required
                      maxLength="5"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className="input-dreamy"
                      placeholder="MM/YY"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-beige-700 mb-2">
                      CVV *
                    </label>
                    <input
                      type="text"
                      name="cvv"
                      required
                      maxLength="4"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      className="input-dreamy"
                      placeholder="123"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-2">
                    Cardholder Name *
                  </label>
                  <input
                    type="text"
                    name="cardName"
                    required
                    value={formData.cardName}
                    onChange={handleInputChange}
                    className="input-dreamy"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="card-dreamy p-6">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="w-5 h-5 text-beige-600" />
                <h2 className="text-lg font-semibold text-beige-900">Shipping Address</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    className="input-dreamy"
                    placeholder="123 Main Street"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-beige-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="input-dreamy"
                      placeholder="New York"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-beige-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      className="input-dreamy"
                      placeholder="NY"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-beige-700 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      required
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="input-dreamy"
                      placeholder="10001"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-beige-700 mb-2">
                      Country *
                    </label>
                    <select
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleInputChange}
                      className="input-dreamy"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={processing}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Complete Order</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="card-dreamy p-6 h-fit">
          <div className="flex items-center space-x-2 mb-4">
            <ShoppingBag className="w-5 h-5 text-beige-600" />
            <h2 className="text-lg font-semibold text-beige-900">Order Summary</h2>
          </div>
          
          <div className="space-y-3 mb-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-beige-700">
                  {item.book.title} × {item.quantity}
                </span>
                <span className="text-beige-900 font-medium">
                  ${(parseFloat(item.book.price) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          
          <div className="space-y-2 pt-4 border-t border-beige-200">
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
            
            <div className="flex justify-between text-lg font-semibold text-beige-900 pt-2 border-t border-beige-200">
              <span>Total</span>
              <span>${(total * 1.08).toFixed(2)}</span>
            </div>
          </div>
          
          <div className="mt-6 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">Secure SSL encrypted checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
