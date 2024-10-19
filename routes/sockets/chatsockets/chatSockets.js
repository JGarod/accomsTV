// chatSockets.js
const { Server } = require('socket.io');

const setupChatSockets = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (room) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room: ${room}`);
    });

    socket.on('leave-room', (room) => {
      socket.leave(room);
      console.log(`User ${socket.id} left room: ${room}`);
    });

    socket.on('chat-message', ({ room, message, user ,iduser}) => {
      io.to(room).emit('chat-message', { message, user,iduser });
      console.log(`Message to ${room}: ${message} ${iduser}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io; // Devuelve la instancia de Socket.IO
};

module.exports = setupChatSockets;
