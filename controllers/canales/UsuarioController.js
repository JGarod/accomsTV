const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/Usuario');
require('dotenv').config();


const getUsuarioAutenticado = async (req, res) => {
  try {
    // Crear el usuario en la base de datos
    console.log(req.usuarioi);
  } catch (err) {
    console.log(err)
    return res.status(500).send({
      msg: 'Error al buscar los canales'
    });
  }
};

module.exports = {
  getUsuarioAutenticado,
}