import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app';
import { connectDB } from './config/database';
import { logger } from './config/logger';
import { initSocket } from './modules/sockets/socket.service';

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Start server
const startServer = async () => {
  await connectDB();
  
  server.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
