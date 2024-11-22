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
// const config = require('./config-rtmp/rtmp-config-aws');
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


// Definir las rutas absolutas a los certificados
const certsPath = path.join(__dirname, '..', 'certs');
const keyPath = path.join(certsPath, 'accomz.work.gd.key');
const certPath = path.join(certsPath, 'accomz.work.gd.cer');
const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },  
  http: {
    port: 8000,
    mediaroot: './media',
    allow_origin: '*'
  },
  https: {
    port: 8443,
    mediaroot: './media',
    allow_origin: '*',
    key: keyPath,    // Usar la ruta absoluta
    cert: certPath   // Usar la ruta absoluta  // Usar las mismas opciones que funcionan en el puerto 3000
  },
  auth: {
    play: false,
    publish: false
  },
  trans: {
    ffmpeg: `${process.env.FFMPEG}`,
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
        hlsKeep: false,
        dash: true,
        dashFlags: '[f=dash:window_size=3:extra_window_size=5]',
        dashKeep: false,
        exec: `ffmpeg -i rtmp://localhost/live/$name -c copy -f mp4 ./mediaPrueba/$name.mp4`
      }
    ]
  }
};
if (!fs.existsSync('./certs/accomz.work.gd.key') || !fs.existsSync('./certs/accomz.work.gd.cer')) {
  console.error('No se pueden encontrar los archivos de certificados');
  process.exit(1);
}
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
