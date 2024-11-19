const { Op } = require("sequelize");
const User = require("../../models/Usuario");
const deleteTempFiles = require("../../helpers/deletemulterConfig");



const validarUsuarioExistenteporID = async (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const user = await User.findOne({
    where: {
      [Op.or]: [
        { nombre: username },
        { correo: email }
      ],
      id: {
        [Op.ne]: req.usuarioId // Asegúrate de que el id no sea igual a req.usuarioid
      }
    }
  });
  if (user) {
    deleteTempFiles(req.files);
    let msg = '';

    // Verificamos si el usuario existe con el correo o con el nombre de usuario
    if (user.nombre === username) {
      msg = 'El nombre de usuario ya está en uso';
    } else if (user.correo === email) {
      msg = 'El correo electrónico ya está en uso';
    }

    // Respondemos con el mensaje específico
    return res.status(401).send({
      msg: msg
    });
  } else {
    return next();
  }
};
module.exports = {
  validarUsuarioExistenteporID,
}