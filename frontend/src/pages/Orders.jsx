import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Calendar, 
  Package, 
  Download,
  Eye,
  Truck
} from 'lucide-react';
import { api } from '../utils/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.orders.getOrders();
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await api.orders.getOrder(orderId);
      setSelectedOrder(response.data.order);
      setShowModal(true);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    }
  };

  const downloadReceipt = async (order) => {
    // Generate a simple receipt PDF content
    const receiptContent = `
      RECEIPT
      =====================================
      Order Number: ${order.orderNumber}
      Date: ${new Date(order.createdAt).toLocaleDateString()}
      
      Items:
      ${order.items?.map(item => 
        `${item.book.title} x${item.quantity} - $${(parseFloat(item.price) * item.quantity).toFixed(2)}`
      ).join('\n') || 'No items'}
      
      Total: $${order.totalAmount}
      Payment Method: ${order.paymentMethod}
      Status: ${order.status}
      
      Thank you for your purchase!
      =====================================
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `receipt-${order.orderNumber}.txt`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-beige-100 text-beige-800 border-beige-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return Package;
      case 'processing':
        return Truck;
      case 'pending':
        return Calendar;
      default:
        return ShoppingBag;
    }
  };

  const OrderCard = ({ order }) => {
    const StatusIcon = getStatusIcon(order.status);
    
    return (
      <div className="card-dreamy p-6 hover:shadow-elegant transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-beige-900 mb-1">
              Order #{order.orderNumber}
            </h3>
            <p className="text-sm text-beige-600">
              {new Date(order.createdAt).toLocaleDateString()} at{' '}
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
          
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
            <StatusIcon className="w-3 h-3 inline mr-1" />
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-beige-600">Items:</span>
            <span className="text-beige-900">{order.items?.length || 0}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-beige-600">Total:</span>
            <span className="font-semibold text-beige-900">${order.totalAmount}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-beige-600">Payment:</span>
            <span className="text-beige-900">{order.paymentMethod}</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => viewOrderDetails(order.id)}
            className="btn-secondary text-sm flex items-center space-x-1 flex-1"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </button>
          
          <button
            onClick={() => downloadReceipt(order)}
            className="btn-primary text-sm flex items-center space-x-1 flex-1"
          >
            <Download className="w-4 h-4" />
            <span>Receipt</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-beige-900">My Orders</h1>
        <p className="text-beige-600">Track and manage your purchases</p>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rosegold-500 mx-auto"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="card-dreamy p-8 text-center">
          <ShoppingBag className="w-16 h-16 text-beige-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-beige-600 mb-2">No orders yet</h3>
          <p className="text-beige-500 mb-4">When you make purchases, they'll appear here</p>
          <a href="/books" className="btn-primary">
            Start Shopping
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card-dreamy w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-beige-900">
                Order Details
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-beige-400 hover:text-beige-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Order Information */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-beige-600">Order Number</p>
                  <p className="font-medium text-beige-900">{selectedOrder.orderNumber}</p>
                </div>
                
                <div>
                  <p className="text-sm text-beige-600">Order Date</p>
                  <p className="font-medium text-beige-900">
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-beige-600">Status</p>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </span>
                </div>
                
                <div>
                  <p className="text-sm text-beige-600">Payment Method</p>
                  <p className="font-medium text-beige-900">{selectedOrder.paymentMethod}</p>
                </div>
              </div>
              
              {selectedOrder.shippingAddress && (
                <div>
                  <p className="text-sm text-beige-600 mb-1">Shipping Address</p>
                  <p className="text-beige-900">{selectedOrder.shippingAddress}</p>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-semibold text-beige-900 mb-3">Items Ordered</h3>
              <div className="space-y-3">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-3 bg-beige-50 rounded-lg">
                    <div className="w-12 h-14 bg-gradient-to-br from-beige-200 to-rosegold-200 rounded flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-beige-500" />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-beige-900">{item.book?.title}</h4>
                      <p className="text-sm text-beige-600">by {item.book?.author}</p>
                      <p className="text-sm text-beige-600">Quantity: {item.quantity}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-beige-900">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-beige-600">${item.price} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Total */}
            <div className="border-t border-beige-200 pt-4">
              <div className="flex justify-between text-lg font-semibold text-beige-900">
                <span>Total</span>
                <span>${selectedOrder.totalAmount}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => downloadReceipt(selectedOrder)}
                className="btn-primary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Receipt</span>
              </button>
              
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
