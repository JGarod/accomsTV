const express = require('express');
const router = express.Router();
const authRoutes = require('./auth'); // Importa las rutas de autenticación
const CanalesRoutes = require('./canales/canales'); // Importa las rutas de autenticación

// Usa las rutas de autenticación
router.use('/auth', authRoutes); 
router.use('/channels', CanalesRoutes); 
module.exports = router;
// Exporta el enrutador