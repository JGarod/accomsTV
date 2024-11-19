const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/Usuario');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// // Registro de usuario
// const registroUsuario = async (req, res) => {
//   const { nombre, password,correo } = req.body;
//   try {
//     // Hashear la password
//     const hash = await bcrypt.hash(password, 10);

//     // Crear el usuario en la base de datos
//     const newUser = await User.create({
//       nombre:nombre,
//       password: hash,
//       correo:correo
//     });

//     res.json({ msg: 'Usuario registrado', user: newUser });
//   } catch (err) {
//     console.log(err)
//     res.status(500).send({
//       msg:'Error al registrar usuario'
//     });
//   }
// };

// Validacion de claves
const validatePassword = async (req, res) => {
  try {
    let password = req.body.password;
    // Buscar al usuario en la base de datos
    const user = await User.findOne({ where: { id: req.usuarioId } });

    if (!user) {
      return res.status(401).send({
        msg: 'Usuario no encontrado'
      });
    }

    // Comparar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send({
        msg: 'La contraseña que ingreso es incorrecta'
      });
    }
    return res.status(200).send({
      msg: 'Clave correcta'
    });

  } catch (err) {
    console.log(err);
    return res.status(500).send({
      msg: 'Error en el servidor'
    });
  }
};

// Perfil del usuario (ruta protegida)
const GetConfigperfilUsuario = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.usuarioId
      },
      attributes: ['nombre', 'id', 'logo', 'portada', 'correo'],
    });
    return res.json(user);
  } catch (err) {
    res.status(500).send({
      msg: 'Error al obtener el perfil'
    });
  }
};

const uploadProfileImage = async (req, res) => {
  try {
    const username = req.body.username;
    const email = req.body.email;
    const id = req.usuarioId;
    console.log(req.usuarioi);

    let logoActual = req.usuarioi.logo;
    let portadaActual = req.usuarioi.portada;

    // Accede a los archivos en `req.files`, comprobando si existen
    const profileFile = req.files && req.files['profile'] ? req.files['profile'][0] : null;
    const wallFile = req.files && req.files['wall'] ? req.files['wall'][0] : null;

    // Si el `username` no está en el cuerpo de la solicitud, envía un error (opcional, según necesidades)
    if (!username) {
      return res.status(400).send({ message: 'Username es obligatorio' });
    }

    // Directorio del usuario
    const userDir = path.join(__dirname, `../../assets/usuarios/${username}`);

    // Crea la carpeta del usuario si no existe
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    // Maneja el archivo de perfil si se envió
    if (profileFile) {
      const profilePath = path.join(userDir, 'profile.jpg');
      // let extensionProfile = path.extname(profileFile.originalname);
      if (fs.existsSync(profilePath)) fs.unlinkSync(profilePath); // Elimina archivo anterior si existe
      fs.renameSync(profileFile.path, profilePath); // Mueve el archivo cargado al directorio final
      logoActual = `/assets/usuarios/${username}/profile.jpg`
    }

    // Maneja el archivo de fondo si se envió
    if (wallFile) {
      const wallPath = path.join(userDir, 'wall.jpg');
      // let extensionWall = path.extname(wallFile.originalname);
      if (fs.existsSync(wallPath)) fs.unlinkSync(wallPath); // Elimina archivo anterior si existe
      fs.renameSync(wallFile.path, wallPath); // Mueve el archivo cargado al directorio final
      portadaActual = `/assets/usuarios/${username}/wall.jpg`

    }

    await User.update(
      {
        nombre: username,
        correo: email,
        logo: logoActual,
        portada: portadaActual,
      },
      {
        where: { id: id } // Condición para encontrar el usuario con ese 'id'
      }
    )
      .then(async () => {
        return res.status(200).send({
          msg: 'Datos actualizados correctamente'
        });
      }).catch((e) => {
        return res.status(401).send({
          msg: 'Ocurrio un error al tratar de actualizar el perfil'
        });
      })

  } catch (err) {
    console.log(err);
    return res.status(500).send({
      msg: 'Error al obtener el perfil'
    });
  }
};


module.exports = {
  // registroUsuario,
  // loginUsuario,
  uploadProfileImage,
  validatePassword,
  GetConfigperfilUsuario
}