const bcrypt = require('bcrypt');
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
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
  email: {
    type: DataTypes.STRING(254),
    allowNull: false,
    unique: true,
    validate: { isEmail: true, len: [3, 254] }
  },
  senhaHash: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'usuarios',
  defaultScope: {
    attributes: { exclude: ['senhaHash'] }
  },
  scopes: {
    withPasswordHash: {
      attributes: { include: ['senhaHash'] }
    }
  },
  hooks: {
    beforeCreate: async usuario => {
      usuario.senhaHash = await bcrypt.hash(usuario.senhaHash, 10);
    }
  }
});

module.exports = Usuario;
