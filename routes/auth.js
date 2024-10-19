const express = require('express');
const router = express.Router();
const { registroUsuario ,loginUsuario,perfilUsuario} = require('../controllers/authController.js');
const { verificarToken } = require('../middleware/authJWT.js');
const { validarContrasenas, validarUsuarioExistente } = require('../middleware/usuario/usuarioMiddleware.js');

// Rutas para autenticación
router.post('/registro', [validarContrasenas,validarUsuarioExistente],registroUsuario);
router.post('/login', loginUsuario);
router.get('/perfil',  [verificarToken],perfilUsuario);

module.exports = router;
