const { Server } = require('socket.io');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    // Join a live class room
    socket.on('join-room', ({ liveClassId, userId, userName }) => {
      socket.join(liveClassId);
      socket.to(liveClassId).emit('user-joined', { userId, userName, socketId: socket.id });
    });

    // WebRTC signaling
    socket.on('signal', ({ liveClassId, signal, to }) => {
      io.to(to).emit('signal', { signal, from: socket.id });
    });

    // Broadcast chat messages
    socket.on('chat-message', ({ liveClassId, message, user }) => {
      io.to(liveClassId).emit('chat-message', { message, user });
    });

    // Whiteboard events
    socket.on('whiteboard-update', ({ liveClassId, data }) => {
      socket.to(liveClassId).emit('whiteboard-update', data);
    });

    // Handle disconnect
    socket.on('disconnecting', () => {
      const rooms = Array.from(socket.rooms);
      rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.to(room).emit('user-left', { socketId: socket.id });
        }
      });
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
}

module.exports = { initSocket, getIO };