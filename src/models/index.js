
const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const Purchase = require('./Purchase');

module.exports = { sequelize, User, Product, Purchase };
