const express = require('express');
const router = express.Router();
const { verificarToken } = require('../../middleware/authJWT.js');
const { getUsuarioAutenticado } = require('../../controllers/canales/UsuarioController.js');

// Rutas para autenticación
// router.post('/registro', [validarContrasenas,validarUsuarioExistente],registroUsuario);
// router.post('/login', loginUsuario);
router.get('/getUserAuth', [verificarToken], getUsuarioAutenticado);

module.exports = router;
