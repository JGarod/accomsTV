const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StreamUsuario = sequelize.define('StreamUsuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  id_game: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
   titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
}, {
  tableName: 'streamUsuario',  // Nombre de la tabla en MySQL
  timestamps: false
});

module.exports = User;
