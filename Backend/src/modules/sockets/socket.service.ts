import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../../config/logger';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      (socket as any).user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`User connected to socket: ${socket.id}`);

    // Join a group room
    socket.on('join:group', (groupId: string) => {
      socket.join(groupId);
      logger.info(`Socket ${socket.id} joined group ${groupId}`);
    });

    // Leave a group room
    socket.on('leave:group', (groupId: string) => {
      socket.leave(groupId);
      logger.info(`Socket ${socket.id} left group ${groupId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected from socket: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
