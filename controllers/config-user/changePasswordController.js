const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/Usuario');
const { where } = require('sequelize');
require('dotenv').config();


// Validacion de claves
const changePasswordUser = async (req, res) => {
  try {
    let passwordActual = req.body.passwordActual;
    // Buscar al usuario en la base de datos
    const user = await User.findOne({ where: { id: req.usuarioId } });

    if (!user) {
      return res.status(401).send({
        msg: 'Usuario no encontrado'
      });
    }

    // Comparar la contraseña
    const isMatch = await bcrypt.compare(passwordActual, user.password);

    if (!isMatch) {
      return res.status(401).send({
        msg: 'La contraseña actual es incorrecta'
      });
    }else{
      if (passwordActual === req.body.password) {
        return res.status(401).send({
          msg: 'La contraseña nueva no puede ser igual a la anterior'
        });
      }else{
        const hash = await bcrypt.hash(req.body.password, 10);

        await User.update({ password: hash }, { where: { id: req.usuarioId } });
        return res.status(200).send({
          msg: 'Clave cambiada'
         });
      }

    }

  } catch (err) {
    console.log(err);
    return res.status(500).send({
      msg: 'Error en el servidor'
    });
  }
};




module.exports = {
  changePasswordUser
}
