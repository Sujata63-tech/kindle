const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Chat = sequelize.define('Chat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true },
  message: {
    type: DataTypes.TEXT,
    allowNull: false },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id' }},
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id' }},
  gift: {
    type: DataTypes.STRING,
    allowNull: true },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  } }, {
  timestamps: true
});
module.exports = Chat;
