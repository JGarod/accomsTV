const { Op } = require("sequelize");
const User = require("../../models/Usuario");

// Middleware para verificar el token JWT
const validarContrasenas = (req, res, next) => {
    const { nombre, password,correo ,passwordDos} = req.body;

    if (!nombre || !password || !correo || !passwordDos) {
      return res.status(400).send('Usuario,Correo y contraseña son requeridos');
    }
    if (password === passwordDos) {
        return next();
    } else {
        return res.status(401).send({
          msg:'Las contraseñas son diferentes'
        });
    }
  };

const validarFormatoNombre = (req, res, next) => {
  const { nombre } = req.body;

  // Expresión regular que solo permite letras, números y guion bajo
  const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9_]+$/;

  if (!nombreRegex.test(nombre)) {
    return res.status(400).json({
      msg: 'El nombre solo puede contener letras, números y guion bajo (_). No se permiten espacios ni guiones (-)'
    });
  }

  next();
};

  const validarUsuarioExistente = async (req, res, next) => {
    let {nombre,correo} = req.body
    const user = await User.findOne({ where: { [Op.or]: [{nombre: nombre}, {correo: correo}] } });
    if (user) {
        return res.status(401).send({
          msg:'El usuario o el correo ya esta en uso'
        });
    } else {
        return next();
    }
  };
  module.exports = {
    validarUsuarioExistente,
    validarContrasenas,
    validarFormatoNombre
  }