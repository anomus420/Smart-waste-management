import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

let baseEnv = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Safely remove /api and trailing slashes for the Socket connection
const SOCKET_URL = baseEnv.replace(/\/api\/?$/, '').replace(/\/$/, '');

let socketInstance = null; // singleton — one connection for the whole app

export const useSocket = () => {
  const [socket, setSocket] = useState(socketInstance);

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });
      setSocket(socketInstance);
    }
  }, []);

  return socket;
};