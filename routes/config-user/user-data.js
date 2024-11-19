const express = require('express');
const { verificarToken } = require('../../middleware/authJWT');
const { GetConfigperfilUsuario, uploadProfileImage, validatePassword } = require('../../controllers/config-user/userDataController');
const router = express.Router();
const multer = require('multer');
const { validarUsuarioExistenteporID } = require('../../middleware/user-data.js/userDataMiddleware');
const upload = require('../../helpers/multerConfig');
// Rutas para autenticación

router.get('/get_perfil', [verificarToken], GetConfigperfilUsuario);
router.post(
    '/upload/usuario', [verificarToken,
    upload.fields([
        { name: 'profile', maxCount: 1 },
        { name: 'wall', maxCount: 1 },
    ]),
    validarUsuarioExistenteporID,
],
    uploadProfileImage
);
router.post('/comparate_password/usuario', [verificarToken], validatePassword);
module.exports = router;
