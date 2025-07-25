const User = require('./User');
const Todo = require('./Todo');
const Poetry = require('./Poetry');
const Chat = require('./Chat');
const { Book, CartItem, Order, OrderItem } = require('./Order');

User.hasMany(Todo, { foreignKey: 'userId', as: 'todos' });
User.hasMany(Poetry, { foreignKey: 'userId', as: 'poems' });
User.hasMany(CartItem, { foreignKey: 'userId', as: 'cartItems' });
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });

Todo.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Poetry.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Chat.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Chat.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

CartItem.belongsTo(User, { foreignKey: 'userId', as: 'user' });
CartItem.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });

OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
OrderItem.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

Book.hasMany(CartItem, { foreignKey: 'bookId', as: 'cartItems' });
Book.hasMany(OrderItem, { foreignKey: 'bookId', as: 'orderItems' });

module.exports = {
  User,
  Todo,
  Poetry,
  Chat,
  Book,
  CartItem,
  Order,
  OrderItem
};
