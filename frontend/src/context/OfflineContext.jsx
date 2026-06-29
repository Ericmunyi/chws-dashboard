import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { offlineDB } from '../services/db';
import api from '../services/api';

const OfflineContext = createContext(null);

export function OfflineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const syncingRef = useRef(false);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  useEffect(() => {
    offlineDB.getQueueCount().then(setPendingCount);
  }, []);

  const processQueue = useCallback(async () => {
    if (syncingRef.current || !navigator.onLine) return;
    syncingRef.current = true;
    setSyncing(true);
    try {
      const queue = await offlineDB.getQueue();
      for (const item of queue) {
        try {
          await api({
            method: item.method,
            url: item.url,
            data: item.data,
            headers: item.headers,
          });
          await offlineDB.removeFromQueue(item.id);
        } catch (err) {
          if (err.response?.status !== 400 && err.response?.status !== 409) {
            break;
          }
          await offlineDB.removeFromQueue(item.id);
        }
      }
    } finally {
      const count = await offlineDB.getQueueCount();
      setPendingCount(count);
      syncingRef.current = false;
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      processQueue();
    }
  }, [isOnline, pendingCount, processQueue]);

  const queueRequest = useCallback(async (method, url, data) => {
    await offlineDB.queueAction({ method, url, data, headers: { 'Content-Type': 'application/json' } });
    const count = await offlineDB.getQueueCount();
    setPendingCount(count);
  }, []);

  return (
    <OfflineContext.Provider value={{ isOnline, pendingCount, syncing, queueRequest, processQueue }}>
      {children}
    </OfflineContext.Provider>
  );
}

export const useOffline = () => {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error('useOffline must be used within OfflineProvider');
  return ctx;
};
