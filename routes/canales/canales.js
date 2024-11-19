const express = require('express');
const router = express.Router();
const { verificarToken } = require('../../middleware/authJWT.js');
const { getCanalesOnline, getCanal, getCanalesPorNombre } = require('../../controllers/canales/canalesController.js');

// Rutas para autenticación
// router.post('/registro', [validarContrasenas,validarUsuarioExistente],registroUsuario);
// router.post('/login', loginUsuario);
router.get('/canalesOnline', getCanalesOnline);
router.get('/search/:nombre', getCanalesPorNombre);
router.get('/canal/:nombre', getCanal);
// router.get('/canal/:nombre',  [verificarToken],getCanal); //no eliminar es la authenticacion del de arriba

module.exports = router;
