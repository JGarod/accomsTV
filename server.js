const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
const indexRoutes = require('./routes/index'); 
const NodeMediaServer = require('node-media-server');
const setupChatSockets = require('./routes/sockets/chatsockets/chatSockets'); 
const http = require('http');
const config = require('./config-rtmp/rtmp-config');
const streamManager = require('./config-rtmp/stream-config');
const path = require('path');

dotenv.config();
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
const server = http.createServer(app);
setupChatSockets(server); // Solo configura y no almacenas la instancia
// Rutas
app.use('/api', indexRoutes);  // Prefijo para las rutas de autenticación
const usersAssetsPath = path.join(__dirname, 'assets/usuarios');
console.log('Ruta de imágenes:', usersAssetsPath);

app.use('/assets/usuarios', express.static(usersAssetsPath));

const nms = new NodeMediaServer(config)

streamManager.initialize(nms);

nms.run();


// Iniciar el servidor
const PORT = process.env.PORT || 3000;
sequelize.sync().then(() => {
  server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
}).catch(err => {
  console.error('Error al sincronizar la base de datos:', err);
});
