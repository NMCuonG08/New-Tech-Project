import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import { RootRoutes } from './routes/RootRoutes.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import { WebSocketProvider } from './contexts/WebSocketContext.jsx'
import { registerSW } from 'virtual:pwa-register';

console.log('🚀 Starting app initialization...');

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('New content available, please refresh.');
  },
  onOfflineReady() {
    console.log('✅ App ready to work offline');
  },
  onRegistered(r) {
    console.log('Service Worker registered');
    if (r) {
      r.update();
    }
  },
  onRegisterError(error) {
    console.error('Service Worker registration error:', error);
  },
});

if (updateSW) {
  updateSW();
}

// Setup service worker message handler
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('Message from service worker:', event.data);

    if (event.data && event.data.type === 'notification-click') {
      const { action, data } = event.data;

      if (action === 'view') {
        window.focus();
        if (data.url) {
          window.location.href = data.url;
        }
      }
    }
  });
}

console.log('📦 Creating React root...');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <WebSocketProvider>
          <RootRoutes />
          <Toaster
            position="top-right"
            toastOptions={ {
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '12px 16px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#f1f5f9',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#f1f5f9',
                },
              },
            } }
          />
        </WebSocketProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)

console.log('✅ React app initialized');
