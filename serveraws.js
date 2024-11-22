const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
const indexRoutes = require('./routes/index');
const NodeMediaServer = require('node-media-server');
const setupChatSockets = require('./routes/sockets/chatsockets/chatSockets');
const https = require('https'); // Para usar HTTPS
const fs = require('fs'); // Para leer los archivos del certificado
const config = require('./config-rtmp/rtmp-config-aws');
const streamManager = require('./config-rtmp/stream-config');
const path = require('path');

dotenv.config();
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Configuración de HTTPS
const httpsOptions = {
  key: fs.readFileSync('./certs/accomz.work.gd.key'), // Ruta al archivo .key
  cert: fs.readFileSync('./certs/accomz.work.gd.cer'), // Ruta al archivo .cer
};

// Crear servidor HTTPS en el puerto 3000
const httpsServer = https.createServer(httpsOptions, app);
setupChatSockets(httpsServer); // Conecta los sockets al servidor HTTPS

// Rutas
app.use('/api', indexRoutes);  // Prefijo para las rutas de autenticación
const usersAssetsPath = path.join(__dirname, 'assets/usuarios');
console.log('Ruta de imágenes:', usersAssetsPath);
app.use('/assets/usuarios', express.static(usersAssetsPath));

// RTMP Server
const nms = new NodeMediaServer(config);
streamManager.initialize(nms);
nms.run();

// Iniciar el servidor
const PORT = process.env.PORT || 3000; // Mantén el puerto 3000
sequelize.sync().then(() => {
  httpsServer.listen(PORT, () => {
    console.log(`Servidor HTTPS corriendo en el puerto ${PORT}`);
  });
}).catch(err => {
  console.error('Error al sincronizar la base de datos:', err);
});
