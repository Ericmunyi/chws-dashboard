import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [lastSyncUpdate, setLastSyncUpdate] = useState(null);

  useEffect(() => {
    const s = io(
      import.meta.env.VITE_API_URL
        ? String(import.meta.env.VITE_API_URL).replace(/\/+$/, '')
        : '/',
      { transports: ['websocket', 'polling'] }
    );
    s.on('connect', () => {
      s.emit('join:dashboard');
    });
    s.on('sync:update', (data) => {
      setLastSyncUpdate(data);
    });
    setSocket(s);
    return () => s.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, lastSyncUpdate }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
