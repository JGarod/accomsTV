const User = require("../models/Usuario");

/* IMPORTANTE ESTO ES PARA SABER QUE CANALES ESTAN EN LINEA PONERLOS EN EL CONTROLADOR NUEVO
// const streamManager = require('../config-rtmp/stream-config');

// const streamController = {
//     getActiveStreams: async (req, res) => {
//         try {
//             const stats = streamManager.getStreamStats();
            
//             // Formatea la respuesta para que sea más amigable
//             const formattedStreams = stats.activeStreams
//                 .filter(stream => stream.active)  // Solo streams realmente activos
//                 .map(stream => ({
//                     username: stream.username,
//                     streamUrl: stream.path,
//                     isLive: stream.active
//                 }));

//             res.status(200).json({
//                 success: true,
//                 totalActive: formattedStreams.length,
//                 streams: formattedStreams
//             });
//         } catch (error) {
//             console.error('Error al obtener streams activos:', error);
//             res.status(500).json({
//                 success: false,
//                 message: 'Error al obtener streams activos'
//             });
//         }
//     },

//     // También puedes verificar si un usuario específico está transmitiendo
//     checkUserStream: async (req, res) => {
//         try {
//             const { username } = req.params;
//             const streamStatus = streamManager.isUserStreaming(username);

//             res.status(200).json({
//                 success: true,
//                 ...streamStatus
//             });
//         } catch (error) {
//             console.error('Error al verificar estado del stream:', error);
//             res.status(500).json({
//                 success: false,
//                 message: 'Error al verificar estado del stream'
//             });
//         }
//     }
// };

module.exports = streamController;
ACA FINALIZA
*/
class StreamManager {
    constructor() {
        this.pendingConnections = new Map();
        this.activeStreams = new Map();
        this.streamPaths = new Map();
        this.initialized = false;
        this.activePublishers = new Set();
    }

    async validateUser(nombre, streamKey) {
        try {
            const user = await User.findOne({
                attributes: ['streamKey', 'id'],
                where: { nombre: nombre },
            });
            return user && user.streamKey === streamKey ? user : null;
        } catch (error) {
            console.error('Error en validación de usuario:', error);
            return null;
        }
    }

    isStreamActive(id) {
        const session = this.nms.getSession(id);
        const streamInfo = this.activeStreams.get(id);

        if (!session || !streamInfo) {
            return false;
        }

        // Verificar si publishers existe y es un objeto/Map
        if (!session.publishers || typeof session.publishers !== 'object') {
            // Alternativamente, podemos verificar si el stream está en activePublishers
            const publishPath = `/live/${streamInfo.nombre}`;
            return this.activePublishers.has(publishPath);
        }

        const publishPath = `/live/${streamInfo.nombre}`;

        // Si publishers es un Map, usar has()
        if (session.publishers instanceof Map) {
            return session.publishers.has(publishPath);
        }

        // Si publishers es un objeto regular, verificar como propiedad
        return publishPath in session.publishers;
    }

    isUserCurrentlyStreaming(nombre) {
        let isStreaming = false;
        this.activeStreams.forEach((info, id) => {
            if (info.nombre === nombre && this.isStreamActive(id)) {
                isStreaming = true;
            }
        });
        return isStreaming;
    }

    formatStreamPath(nombre) {
        return `/live/${nombre}`;
    }

    startMonitoring() {
        setInterval(() => {
            const now = Date.now();
            console.log('\n=== Monitoreo de Streams ===');

            // Limpiar conexiones pendientes antiguas
            for (const [id, conn] of this.pendingConnections.entries()) {
                if (now - conn.timestamp > 5000) {
                    this.pendingConnections.delete(id);
                }
            }

            // Verificar streams activos
            console.log('\nStreams activos:');
            for (const [id, info] of this.activeStreams.entries()) {
                const isActive = this.isStreamActive(id);
                console.log(`[${id}] ${info.nombre} - Activo: ${isActive}`);

                if (!isActive) {
                    this.cleanupSpecificStream(id);
                }
            }

            // Mostrar estadísticas actualizadas
            console.log('\nEstadísticas:');
            console.log(`Total streams activos: ${this.activeStreams.size}`);
            console.log(`Publishers activos: ${this.activePublishers.size}`);

            // Mostrar streams por usuario
            const streamsByUser = new Map();
            for (const [id, info] of this.activeStreams.entries()) {
                if (!streamsByUser.has(info.nombre)) {
                    streamsByUser.set(info.nombre, 0);
                }
                if (this.isStreamActive(id)) {
                    streamsByUser.set(info.nombre, streamsByUser.get(info.nombre) + 1);
                }
            }
            console.log('\nStreams por usuario:');
            streamsByUser.forEach((count, user) => {
                console.log(`${user}: ${count} streams activos`);
            });

        }, 10000);
    }

    cleanupSpecificStream(id) {
        const streamInfo = this.activeStreams.get(id);
        if (streamInfo) {
            const publishPath = `/live/${streamInfo.nombre}`;

            // Verificar si hay otros streams activos del mismo usuario antes de eliminar
            let hasOtherActiveStreams = false;
            this.activeStreams.forEach((info, otherId) => {
                if (otherId !== id && info.nombre === streamInfo.nombre && this.isStreamActive(otherId)) {
                    hasOtherActiveStreams = true;
                }
            });

            // Solo eliminar de activePublishers si no hay otros streams activos
            if (!hasOtherActiveStreams) {
                this.activePublishers.delete(publishPath);
                this.streamPaths.delete(streamInfo.nombre);
            }

            // Eliminar este stream específico
            this.activeStreams.delete(id);
        }
        this.pendingConnections.delete(id);
    }

    initialize(nms) {
        if (this.initialized) {
            console.warn('StreamManager ya inicializado');
            return;
        }

        this.nms = nms;
        this.setupEventListeners();
        this.startMonitoring();
        this.initialized = true;
        console.log('StreamManager inicializado correctamente');
    }

    setupEventListeners() {
        this.nms.on('preConnect', (id, args) => {
            console.log(`Nueva conexión [${id}]`);
            this.pendingConnections.set(id, {
                timestamp: Date.now(),
                validated: false
            });
        });

        this.nms.on('prePublish', async (id, StreamPath, args) => {
            const session = this.nms.getSession(id);
            const streamParts = StreamPath.split('/');
            const nombre = streamParts[2];
            const streamKey = args.key;

            console.log(`\nIntento de publicación:`);
            console.log(`ID: ${id}`);
            console.log(`Usuario: ${nombre}`);
            console.log(`Path: ${StreamPath}`);

            try {
                // Validaciones básicas
                if (!nombre || !streamKey) {
                    console.log(`Rechazado: Faltan datos`);
                    session.reject();
                    return false;
                }

                // Validar usuario
                const user = await this.validateUser(nombre, streamKey);
                if (!user) {
                    console.log(`Rechazado: Credenciales inválidas`);
                    session.reject();
                    return false;
                }

                // Verificar si el usuario ya está transmitiendo
                if (this.isUserCurrentlyStreaming(nombre)) {
                    console.log(`Rechazado: Usuario ${nombre} ya está transmitiendo en otra sesión`);
                    session.reject();
                    return false;
                }

                // Registrar el nuevo stream
                const publishPath = this.formatStreamPath(nombre);
                this.activePublishers.add(publishPath);
                this.activeStreams.set(id, {
                    nombre,
                    userId: user.id,
                    startTime: Date.now(),
                    streamPath: publishPath
                });
                this.streamPaths.set(nombre, publishPath);

                if (this.pendingConnections.has(id)) {
                    this.pendingConnections.get(id).validated = true;
                }

                console.log(`Stream autorizado: ${publishPath}`);
                return true;

            } catch (error) {
                console.error('Error en publicación:', error);
                session.reject();
                return false;
            }
        });

        this.nms.on('postPublish', (id, StreamPath, args) => {
            const streamInfo = this.activeStreams.get(id);
            if (streamInfo) {
                console.log(`\nStream iniciado:`);
                console.log(`ID: ${id}`);
                console.log(`Usuario: ${streamInfo.nombre}`);
                console.log(`Path: ${StreamPath}`);
            }
        });

        this.nms.on('donePublish', (id, StreamPath, args) => {
            const streamInfo = this.activeStreams.get(id);
            if (streamInfo) {
                console.log(`\nStream finalizado:`);
                console.log(`ID: ${id}`);
                console.log(`Usuario: ${streamInfo.nombre}`);
                this.cleanupSpecificStream(id);
            }
        });

        this.nms.on('doneConnect', (id, args) => {
            this.cleanupSpecificStream(id);
        });
    }

    getActiveStreamsByUser(nombre) {
        const activeStreams = [];
        this.activeStreams.forEach((info, id) => {
            if (info.nombre === nombre && this.isStreamActive(id)) {
                activeStreams.push({
                    id,
                    streamPath: info.streamPath,
                    startTime: info.startTime
                });
            }
        });
        return activeStreams;
    }

    isUserStreaming(nombre) {
        const publishPath = this.formatStreamPath(nombre);
        const isActive = this.activePublishers.has(publishPath);

        console.log(`\nVerificación de stream para ${nombre}:`);
        console.log(`Path: ${publishPath}`);
        console.log(`Activo: ${isActive}`);

        return {
            isLive: isActive,
            streamPath: isActive ? publishPath : null,
            activeStreams: this.getActiveStreamsByUser(nombre)
        };
    }

    getStreamStats() {
        return {
            totalStreams: this.activeStreams.size,
            activePublishers: this.activePublishers.size,
            streamPaths: Array.from(this.streamPaths.entries()),
            activeStreams: Array.from(this.activeStreams.entries()).map(([id, info]) => ({
                id,
                username: info.nombre,
                path: info.streamPath,
                active: this.isStreamActive(id)
            }))
        };
    }
}

const streamManager = new StreamManager();
module.exports = streamManager;
// const User = require("../models/Usuario");

// class StreamManager {
//     constructor() {
//         this.pendingConnections = new Map();
//         this.activeStreams = new Map();
//         this.streamPaths = new Map();
//         this.initialized = false;
//         this.activePublishers = new Set(); // Nuevo: Set para mantener track de publishers activos
//     }

//     async validateUser(nombre, streamKey) {
//         try {
//             const user = await User.findOne({
//                 attributes: ['streamKey', 'id'],
//                 where: { nombre: nombre },
//             });
//             return user && user.streamKey === streamKey ? user : null;
//         } catch (error) {
//             console.error('Error en validación de usuario:', error);
//             return null;
//         }
//     }

//     isStreamActive(id) {
//         const session = this.nms.getSession(id);
//         const streamInfo = this.activeStreams.get(id);

//         if (!session || !streamInfo) {
//             return false;
//         }

//         // Verificar si publishers existe y es un objeto/Map
//         if (!session.publishers || typeof session.publishers !== 'object') {
//             // Alternativamente, podemos verificar si el stream está en activePublishers
//             const publishPath = `/live/${streamInfo.nombre}`;
//             return this.activePublishers.has(publishPath);
//         }

//         const publishPath = `/live/${streamInfo.nombre}`;

//         // Si publishers es un Map, usar has()
//         if (session.publishers instanceof Map) {
//             return session.publishers.has(publishPath);
//         }

//         // Si publishers es un objeto regular, verificar como propiedad
//         return publishPath in session.publishers;
//     }

//     formatStreamPath(nombre) {
//         return `/live/${nombre}`;
//     }

//     startMonitoring() {
//         setInterval(() => {
//             const now = Date.now();
//             console.log('\n=== Monitoreo de Streams ===');

//             // Limpiar conexiones pendientes antiguas
//             for (const [id, conn] of this.pendingConnections.entries()) {
//                 if (now - conn.timestamp > 5000) {
//                     this.pendingConnections.delete(id);
//                 }
//             }

//             // Verificar streams activos
//             console.log('\nStreams activos:');
//             for (const [id, info] of this.activeStreams.entries()) {
//                 const isActive = this.isStreamActive(id);
//                 console.log(`[${id}] ${info.nombre} - Activo: ${isActive}`);

//                 if (!isActive) {
//                     this.cleanupStream(id);
//                 }
//             }

//             // Mostrar estadísticas
//             console.log('\nEstadísticas:');
//             console.log(`Total streams activos: ${this.activeStreams.size}`);
//             console.log(`Publishers activos: ${this.activePublishers.size}`);

//             // Mostrar streams por usuario
//             const streamsByUser = new Map();
//             for (const [id, info] of this.activeStreams.entries()) {
//                 if (!streamsByUser.has(info.nombre)) {
//                     streamsByUser.set(info.nombre, 0);
//                 }
//                 if (this.isStreamActive(id)) {
//                     streamsByUser.set(info.nombre, streamsByUser.get(info.nombre) + 1);
//                 }
//             }
//             console.log('\nStreams por usuario:');
//             streamsByUser.forEach((count, user) => {
//                 console.log(`${user}: ${count} streams activos`);
//             });

//         }, 10000);
//     }

//     cleanupStream(id) {
//         const streamInfo = this.activeStreams.get(id);
//         if (streamInfo) {
//             const publishPath = `/live/${streamInfo.nombre}`;
//             this.activePublishers.delete(publishPath);
//             this.activeStreams.delete(id);

//             // Verificar si quedan otros streams activos del mismo usuario
//             let hasOtherActiveStreams = false;
//             this.activeStreams.forEach((info, otherId) => {
//                 if (otherId !== id && info.nombre === streamInfo.nombre && this.isStreamActive(otherId)) {
//                     hasOtherActiveStreams = true;
//                 }
//             });

//             if (!hasOtherActiveStreams) {
//                 this.streamPaths.delete(streamInfo.nombre);
//             }
//         }
//         this.pendingConnections.delete(id);
//     }

//     initialize(nms) {
//         if (this.initialized) {
//             console.warn('StreamManager ya inicializado');
//             return;
//         }

//         this.nms = nms;
//         this.setupEventListeners();
//         this.startMonitoring();
//         this.initialized = true;
//         console.log('StreamManager inicializado correctamente');
//     }

//     setupEventListeners() {
//         this.nms.on('preConnect', (id, args) => {
//             console.log(`Nueva conexión [${id}]`);
//             this.pendingConnections.set(id, {
//                 timestamp: Date.now(),
//                 validated: false
//             });
//         });

//         this.nms.on('prePublish', async (id, StreamPath, args) => {
//             const session = this.nms.getSession(id);
//             const streamParts = StreamPath.split('/');
//             const nombre = streamParts[2];
//             const streamKey = args.key;

//             console.log(`\nIntento de publicación:`);
//             console.log(`ID: ${id}`);
//             console.log(`Usuario: ${nombre}`);
//             console.log(`Path: ${StreamPath}`);

//             try {
//                 // Validaciones básicas
//                 if (!nombre || !streamKey) {
//                     console.log(`Rechazado: Faltan datos`);
//                     session.reject();
//                     return false;
//                 }

//                 // Validar usuario
//                 const user = await this.validateUser(nombre, streamKey);
//                 if (!user) {
//                     console.log(`Rechazado: Credenciales inválidas`);
//                     session.reject();
//                     return false;
//                 }

//                 // Registrar el nuevo stream
//                 const publishPath = this.formatStreamPath(nombre);
//                 this.activePublishers.add(publishPath);
//                 this.activeStreams.set(id, {
//                     nombre,
//                     userId: user.id,
//                     startTime: Date.now(),
//                     streamPath: publishPath
//                 });
//                 this.streamPaths.set(nombre, publishPath);

//                 if (this.pendingConnections.has(id)) {
//                     this.pendingConnections.get(id).validated = true;
//                 }

//                 console.log(`Stream autorizado: ${publishPath}`);
//                 return true;

//             } catch (error) {
//                 console.error('Error en publicación:', error);
//                 session.reject();
//                 return false;
//             }
//         });

//         this.nms.on('postPublish', (id, StreamPath, args) => {
//             const streamInfo = this.activeStreams.get(id);
//             if (streamInfo) {
//                 console.log(`\nStream iniciado:`);
//                 console.log(`ID: ${id}`);
//                 console.log(`Usuario: ${streamInfo.nombre}`);
//                 console.log(`Path: ${StreamPath}`);
//             }
//         });

//         this.nms.on('donePublish', (id, StreamPath, args) => {
//             const streamInfo = this.activeStreams.get(id);
//             if (streamInfo) {
//                 console.log(`\nStream finalizado:`);
//                 console.log(`ID: ${id}`);
//                 console.log(`Usuario: ${streamInfo.nombre}`);
//             }
//             this.cleanupStream(id);
//         });

//         this.nms.on('doneConnect', (id, args) => {
//             this.cleanupStream(id);
//         });
//     }

//     getActiveStreamsByUser(nombre) {
//         const activeStreams = [];
//         this.activeStreams.forEach((info, id) => {
//             if (info.nombre === nombre && this.isStreamActive(id)) {
//                 activeStreams.push({
//                     id,
//                     streamPath: info.streamPath,
//                     startTime: info.startTime
//                 });
//             }
//         });
//         return activeStreams;
//     }

//     isUserStreaming(nombre) {
//         const publishPath = this.formatStreamPath(nombre);
//         const isActive = this.activePublishers.has(publishPath);

//         console.log(`\nVerificación de stream para ${nombre}:`);
//         console.log(`Path: ${publishPath}`);
//         console.log(`Activo: ${isActive}`);

//         return {
//             isLive: isActive,
//             streamPath: isActive ? publishPath : null,
//             activeStreams: this.getActiveStreamsByUser(nombre)
//         };
//     }

//     getStreamStats() {
//         return {
//             totalStreams: this.activeStreams.size,
//             activePublishers: this.activePublishers.size,
//             streamPaths: Array.from(this.streamPaths.entries()),
//             activeStreams: Array.from(this.activeStreams.entries()).map(([id, info]) => ({
//                 id,
//                 username: info.nombre,
//                 path: info.streamPath,
//                 active: this.isStreamActive(id)
//             }))
//         };
//     }
// }

// const streamManager = new StreamManager();
// module.exports = streamManager;