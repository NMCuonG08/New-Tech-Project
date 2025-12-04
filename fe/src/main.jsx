import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { RootRoutes } from './routes/RootRoutes.jsx'
import { registerSW } from 'virtual:pwa-register';

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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <RootRoutes />
    </BrowserRouter>
  </StrictMode>,
)
