const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Personagem = sequelize.define('Personagem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(120),
    allowNull: false,
    validate: { notEmpty: true, len: [1, 120] }
  },
  casa: {
    type: DataTypes.STRING(80),
    allowNull: false,
    validate: { notEmpty: true, len: [1, 80] }
  },
  especie: {
    type: DataTypes.STRING(80),
    allowNull: false,
    validate: { notEmpty: true, len: [1, 80] }
  },
  ocupacao: {
    type: DataTypes.STRING(120),
    allowNull: false,
    validate: { notEmpty: true, len: [1, 120] }
  }
}, {
  tableName: 'personagens'
});

module.exports = Personagem;
