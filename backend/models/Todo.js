const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Todo = sequelize.define('Todo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 200] } },
  description: {
    type: DataTypes.TEXT,
    allowNull: true },
  status: {
    type: DataTypes.ENUM('pending', 'completed'),
    defaultValue: 'pending'},
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium' },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id' }}}, {
  timestamps: true
});
module.exports = Todo;
