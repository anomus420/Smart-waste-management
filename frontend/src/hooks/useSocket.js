import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

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