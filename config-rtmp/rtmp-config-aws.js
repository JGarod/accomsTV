// config/nmsConfig.js
require('dotenv').config();
const config = {
    rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60,
        max_connections: 1000
    },
    http: {
        port: 8000,  // Puerto para HLS
        mediaroot: './media', // Ruta donde se almacenan los archivos de video
        allow_origin: '*',
        ssl: { // Agregar soporte SSL para HLS en el puerto 8000
            key: '../certs/accomz.work.gd.key', // Ruta al archivo .key
            cert: '../certs/accomz.work.gd.cer', // Ruta al archivo .cer
        }
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

module.exports = config;
