// config/nmsConfig.js
require('dotenv').config();
const path = require('path');

const certsPath = path.join(__dirname, '..', 'certs');
const keyPath = path.join(certsPath, 'accomz.work.gd.key');
const certPath = path.join(certsPath, 'accomz.work.gd.cer');

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
        port: 8000,  // Puerto para HTTP
        mediaroot: './media',
        allow_origin: '*'
    },
    https: {
        enable: true, // Habilitar explícitamente HTTPS
        port: 8443,
        host: '0.0.0.0', // Escuchar en todas las interfaces
        mediaroot: './media',
        allow_origin: '*',
        key: keyPath,    // Usar la ruta absoluta
        cert: certPath,
        handshakeTimeout: 120, // Timeout del handshake en segundos
        requestCert: false,
        rejectUnauthorized: false
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