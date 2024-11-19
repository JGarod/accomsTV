const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
   correo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  logo: {
    type: DataTypes.STRING,
  },
  portada: {
    type: DataTypes.STRING,
  },
  streamKey: {
    type: DataTypes.STRING,
  }
}, {
  tableName: 'usuarios',  // Nombre de la tabla en MySQL
  timestamps: false
});

module.exports = User;
