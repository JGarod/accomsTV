const express = require('express');
const router = express.Router();
const authRoutes = require('./auth'); // Importa las rutas de autenticación
const CanalesRoutes = require('./canales/canales'); // Importa las rutas de autenticación
const userDataConfigRoutes = require('./config-user/user-data'); // Importa las rutas de autenticación
const authStreamRoutes = require('./config-user/auth-stream'); // Importa las rutas de autenticación

// Usa las rutas de autenticación
router.use('/auth', authRoutes); 
router.use('/channels', CanalesRoutes); 
router.use('/config', userDataConfigRoutes);
router.use('/stream_config', authStreamRoutes);
module.exports = router;
// Exporta el enrutador