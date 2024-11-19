const User = require('../../models/Usuario');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

// Usuario y keyStream
const getDataStream = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.usuarioId
      },
      attributes: ['nombre', 'streamKey'],
    });
    return res.status(200).send({
      usuario: user
    });
  } catch (err) {
    res.status(500).send({
      msg: 'Error al obtener el perfil'
    });
  }
};


// generar un KeyStream
const generateKeyStream = async (req, res) => {
  try {
    const username = req.usuarioi.nombre;

    const id = req.usuarioId;

    const uuid = uuidv4();

    const randomNumbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)).join('');

    const customKey = `${uuid}${randomNumbers}`;

    await User.update(
      {
        streamKey: customKey,
      },
      {
        where: { id: id } // Condición para encontrar el usuario con ese 'id'
      }
    )
      .then(async () => {
        return res.status(200).send({
          msg: 'Los datos del stream fueron generados correctamente!',
          nombre: username,
          streamKey: customKey,
        });
      }).catch((e) => {
        return res.status(401).send({
          msg: 'Ocurrio un error al tratar de actualizar el perfil'
        });
      });

  } catch (err) {
    res.status(500).send({
      msg: 'Error al obtener el perfil'
    });
  }
};


module.exports = {
  getDataStream,
  generateKeyStream,
}