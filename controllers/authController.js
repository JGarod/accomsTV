const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Usuario');
require('dotenv').config();

// Registro de usuario
const registroUsuario = async (req, res) => {
  const { nombre, password,correo } = req.body;
  try {
    // Hashear la password
    const hash = await bcrypt.hash(password, 10);

    // Crear el usuario en la base de datos
    const newUser = await User.create({
      nombre:nombre,
      password: hash,
      correo:correo
    });

    res.json({ msg: 'Usuario registrado', user: newUser });
  } catch (err) {
    console.log(err)
    res.status(500).send({
      msg:'Error al registrar usuario'
    });
  }
};

// Login de usuario
const loginUsuario = async (req, res) => {
  const { nombre, password } = req.body;

  if (!nombre || !password) {
    return res.status(400).send({
      msg:'Usuario y contraseña son requeridos'
    });
  }

  try {
    // Buscar al usuario en la base de datos
    const user = await User.findOne({ where: { nombre } });

    if (!user) {
      return res.status(401).send({
        msg:'Usuario no encontrado'
      });
    }

    // Comparar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send({
        msg:'Contraseña incorrecta'
      });
    }

    // Generar el token JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
let usuario = {
  nombre:user.nombre,
  logo:user.logo,
  id:user.id,
}
    res.json({ token,usuario });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      msg:'Error en el servidor'
    });
  }
};

// Perfil del usuario (ruta protegida)
const perfilUsuario = async (req, res) => {
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
      msg:'Error al obtener el perfil'
    });
  }
};


module.exports ={
    registroUsuario,
    loginUsuario,
    perfilUsuario
}