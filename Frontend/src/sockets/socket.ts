import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/useAuthStore';

let socket: Socket | null = null;

export const connectSocket = () => {
  if (socket) return socket;
  
  const token = useAuthStore.getState().token;
  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
    auth: { token },
    reconnection: true,
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
