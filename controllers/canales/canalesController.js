const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/Usuario');
const { Op } = require('sequelize');
require('dotenv').config();


const getCanalesOnline = async (req, res) => {
  try {
    // Crear el usuario en la base de datos
    const usuarios = await User.findAll({
    attributes:['nombre','id','logo']
    });

    return res.json({ msg: 'Usuarios online', canales: usuarios });
  } catch (err) {
    console.log(err)
   return res.status(500).send({
      msg:'Error al buscar los canales'
    });
  }
};

const getCanal = async (req, res) => {
  try {
    // Crear el usuario en la base de datos
    const usuario = await User.findOne({
    attributes:['nombre','id','logo','portada'],
    where:{
      nombre:req.params.nombre
    }
    });

    if (!usuario) {
      return res.status(404).send({
        msg: 'Este canal no existe'
      });
    }

    return res.json({  canal: usuario });
  } catch (err) {
    console.log(err)
   return res.status(500).send({
      msg:'Error al buscar los canales'
    });
  }
};

const getCanalesPorNombre = async (req, res) => {
  try {
    // Crear el usuario en la base de datos
    const usuarios = await User.findAll({
      attributes: ['nombre', 'id', 'logo'],
      where: {
        nombre: {
          [Op.like]: `%${req.params.nombre}%` // Busca coincidencias parciales
        }
      },
      limit: 30
    });

    return res.json({ msg: 'Canales encontrados', canales: usuarios });
  } catch (err) {
    console.log(err)
    return res.status(500).send({
      msg: 'Error al buscar los canales'
    });
  }
};

module.exports ={
    getCanalesOnline,
  getCanal,
  getCanalesPorNombre
}