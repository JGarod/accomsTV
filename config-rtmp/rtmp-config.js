// config/nmsConfig.js
require('dotenv').config();
const config = {
    rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60,
        max_connections: 1000  // Ajusta según tus necesidades
    },
    https: {
        port: 8000,
        mediaroot: './media',
        allow_origin: '*'
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
                hlsKeep: false, // para evitar que se borren los archivos hls después de terminar la transmisión
                dash: true,
                dashFlags: '[f=dash:window_size=3:extra_window_size=5]',
                dashKeep: false, // para evitar que se borren los archivos dash después de terminar la transmisión
                exec: `ffmpeg -i rtmp://localhost/live/$name -c copy -f mp4 ./mediaPrueba/$name.mp4`
            }
        ]
    }
};

module.exports = config;
