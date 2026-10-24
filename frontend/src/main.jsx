import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { OfflineProvider, useOffline } from './context/OfflineContext';
import { setOfflineQueue } from './services/api';
import App from './App';
import './index.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  });
}

function OfflineInit() {
  const { queueRequest } = useOffline();
  useEffect(() => {
    setOfflineQueue((method, url, data) => queueRequest(method, url, data));
  }, [queueRequest]);
  return null;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <OfflineProvider>
          <OfflineInit />
          <SocketProvider>
            <App />
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          </SocketProvider>
        </OfflineProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
