const path = require('path');
const { Sequelize } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL || 'sqlite:./database.sqlite';

if (!databaseUrl.startsWith('sqlite:')) {
  throw new Error('DATABASE_URL deve usar SQLite (exemplo: sqlite:./database.sqlite).');
}

const configuredStorage = databaseUrl.slice('sqlite:'.length);
const storage = configuredStorage === ':memory:'
  ? ':memory:'
  : path.resolve(__dirname, '../../', configuredStorage.replace(/^\.([/\\])/, ''));

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage,
  logging: false
});

module.exports = sequelize;
