// chatSockets.js
const { Server } = require('socket.io');

const setupChatSockets = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // io.on('connection', (socket) => {
  //   console.log('User connected:', socket.id);

  //   socket.on('join-room', (room) => {
  //     socket.join(room);
  //     console.log(`User ${socket.id} joined room: ${room}`);
  //   });

  //   socket.on('leave-room', (room) => {
  //     socket.leave(room);
  //     console.log(`User ${socket.id} left room: ${room}`);
  //   });

  //   socket.on('chat-message', ({ room, message, user ,iduser}) => {
  //     io.to(room).emit('chat-message', { message, user,iduser });
  //     console.log(`Message to ${room}: ${message} ${iduser}`);
  //   });

  //   socket.on('disconnect', () => {
  //     console.log('User disconnected:', socket.id);
  //   });
  // });
  // Almacena el número de usuarios por sala
  let roomUsersCount = {};

  // Almacena los temporizadores de eliminación de salas
  let roomTimers = {};

  // Cuando un cliente se conecta
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Unirse a una sala
    socket.on('join-room', (room) => {
      socket.join(room);

      // Si la sala no existe en nuestro registro, inicializamos el contador
      if (!roomUsersCount[room]) {
        roomUsersCount[room] = 0;
      }

      // Incrementar el contador de usuarios en la sala
      roomUsersCount[room] += 1;
      console.log(`User ${socket.id} joined room: ${room}. Users in room: ${roomUsersCount[room]}`);

      // Si había un temporizador de eliminación de la sala, lo cancelamos
      if (roomTimers[room]) {
        clearTimeout(roomTimers[room]);
        delete roomTimers[room];
      }
    });

    // Salir de una sala
    socket.on('leave-room', (room) => {
      socket.leave(room);

      // Decrementar el contador de usuarios en la sala
      if (roomUsersCount[room]) {
        roomUsersCount[room] -= 1;
        console.log(`User ${socket.id} left room: ${room}. Users in room: ${roomUsersCount[room]}`);

        // Si la sala se queda sin usuarios, activar temporizador para eliminarla
        if (roomUsersCount[room] === 0) {
          setRoomDeletionTimer(room);
        }
      }
    });

    // Escuchar mensajes de chat
    socket.on('chat-message', ({ room, message, user, iduser }) => {
      io.to(room).emit('chat-message', { message, user, iduser });
      console.log(`Message to ${room}: ${message} ${iduser}`);
    });

    // Cuando un cliente se desconecta
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);

      // También aquí podemos verificar las salas de las que el socket era parte si es necesario
      // pero no es esencial porque usamos el evento `leave-room` arriba para gestionar esto
    });
  });

  // Función para eliminar salas vacías tras un tiempo de espera
  const setRoomDeletionTimer = (room) => {
    roomTimers[room] = setTimeout(() => {
      console.log(`Deleting room: ${room} after being empty`);
      delete roomUsersCount[room];
      delete roomTimers[room];
    }, 1 * 60 * 1000);  // 1 minutos de espera antes de eliminar la sala
  };

  return io; // Devuelve la instancia de Socket.IO
};

module.exports = setupChatSockets;
