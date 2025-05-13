const { Op } = require("sequelize");
const User = require("../../models/Usuario");
const deleteTempFiles = require("../../helpers/deletemulterConfig");


// Middleware para verificar el token JWT
const validarContrasenasUserData = (req, res, next) => {
  const {  password, passwordDos } = req.body;
  if (password === passwordDos) {
    return next();
  } else {
    return res.status(401).send({
      msg: 'Las contraseñas son diferentes'
    });
  }
};

module.exports = {
  validarContrasenasUserData,
}