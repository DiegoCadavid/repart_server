const { Sequelize } = require('sequelize');

const db = new Sequelize('repart', process.env.DB_USER, process.env.DB_PASSWORD,{
  host : process.env.DB_HOST,
  dialect: 'mysql',
  logging: false //dev
});

module.exports = db;