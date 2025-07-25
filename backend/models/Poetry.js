const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Poetry = sequelize.define('Poetry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 200] }},
  author: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 100]
    } },
  content: {
    type: DataTypes.TEXT,
    allowNull: true },
  category: {
    type: DataTypes.STRING,
    allowNull: true },
  tags: {
    type: DataTypes.STRING,
    allowNull: true },
  filePath: {
    type: DataTypes.STRING,
    allowNull: true },
  fileName: {
    type: DataTypes.STRING,
    allowNull: true },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: true },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id' }}}, {
  timestamps: true
});
module.exports = Poetry;
