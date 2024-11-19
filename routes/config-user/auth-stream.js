const express = require('express');
const { verificarToken } = require('../../middleware/authJWT');
const router = express.Router();
const { getDataStream, generateKeyStream } = require('../../controllers/config-user/AuthStreamController');
// Rutas para autenticación

router.get('/get_keys', [verificarToken], getDataStream);
router.get('/generate_Key', [verificarToken], generateKeyStream);

module.exports = router;
