const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
const indexRoutes = require('./routes/index'); 
const NodeMediaServer = require('node-media-server');
const setupChatSockets = require('./routes/sockets/chatsockets/chatSockets'); 
const http = require('http');

dotenv.config();
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
const server = http.createServer(app);
setupChatSockets(server); // Solo configura y no almacenas la instancia
// Rutas
app.use('/api', indexRoutes);  // Prefijo para las rutas de autenticación
// Crear servidor HTTP para manejar tanto Express como sockets

// C:/Users/juanm/Documents/proyecto/accomz/ffmpeg-7.1-full_build/bin/ffmpeg
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
  trans: {
    ffmpeg: 'C:/Users/juanm/Documents/proyecto/accomz/ffmpeg-7.1-full_build/bin/ffmpeg.exe',
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
        hlsKeep: true, // to prevent hls file delete after end the stream
        dash: true,
        dashFlags: '[f=dash:window_size=3:extra_window_size=5]',
        dashKeep: true // to prevent dash file delete after end the stream
      }
    ]
  }
};
// const usuarios = {
//   'JuanGarod': { clave: 'clave123', token: 'tokenJuanGarod' },
//   'MariaLopez': { clave: 'clave456', token: 'tokenMariaLopez' }
// };

var nms = new NodeMediaServer(config)
// const validarToken = (user, token) => {
//   const usuario = usuarios[user];
//   return usuario && usuario.token === token;
// };

// nms.on('prePublish', (id, StreamPath, args) => {
//   const session = nms.getSession(id);
//   const pathSegments = StreamPath.split('/');

//   // Verificamos que hay suficientes segmentos
//   if (pathSegments.length < 3) {
//     console.error(`Error: no se proporcionaron suficientes parámetros.`);
//     session.reject();
//     return;
//   }

//   const app = pathSegments[1]; // 'live'
//   const user = pathSegments[2]; // 'JuanGarod'
//   const token = pathSegments[3]; // 'token'
//   pathSegments.forEach((element,index) => {
//     console.log(`${index}`,element);
//       });
//   // Validar el token
//   if (!validarToken(user, token)) {
//     console.error(`Acceso denegado: token inválido.`);
//     session.reject(); // Rechaza la sesión si el token es inválido
//   } else {
//     console.log(`Acceso permitido para el usuario: ${user}`);
//   }
// });

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
