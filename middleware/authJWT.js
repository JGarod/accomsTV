const jwt = require('jsonwebtoken');
const User = require('../models/Usuario');
require('dotenv').config();

// Middleware para verificar el token JWT
const verificarToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).send({
      msg:'Token requerido',
      token:0,
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).send({
        msg:'Token inválido',
        token:0,
      });
    }
    console.log(decoded);
    req.usuarioId = decoded.id;
    const user = await User.findOne({ where: { id :req.usuarioId  }, attributes: ['id','nombre','logo','portada']});
    req.usuarioi = user;
    next();
  });
};

module.exports = {
    verificarToken
}
