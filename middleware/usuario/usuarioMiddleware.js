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
    validarContrasenas
  }