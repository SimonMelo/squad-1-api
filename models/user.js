// models/user.js

const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const User = sequelize.define('User', {
  cpfCnpj: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = User;
