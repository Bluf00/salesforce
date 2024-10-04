require('dotenv').config();

const Sequelize = require('sequelize');

const sequelize = process.env.DB_URL
  ? new Sequelize(process.env.DB_URL)
  : new Sequelize(process.env.DB_NAME || 'ecommerce_db', process.env.DB_USER || 'postgres', process.env.DB_PASSWORD || 'password21', {
      host: 'localhost',
      dialect: 'postgres',
      dialectOptions: {
        decimalNumbers: true,
      },
    });

module.exports = sequelize;
