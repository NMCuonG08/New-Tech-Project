import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { useAuth } from './useAuth';
import { useAlertsStore } from '../store/alertsStore';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const useWebSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const addAlert = useAlertsStore(state => state.addAlert);
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  console.log('🔍 useWebSocket hook called');
  console.log('  - isAuthenticated:', isAuthenticated);
  console.log('  - user:', user?.id || 'no user');
  console.log('  - isConnected:', isConnected);

  useEffect(() => {
    // Only connect if user is authenticated
    if (!isAuthenticated || !user) {
      return;
    }

    console.log('🔌 Initializing WebSocket connection...');

    const newSocket = io(BACKEND_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected', newSocket.id);
      setIsConnected(true);
      reconnectAttempts.current = 0;
      
      // Join room with user ID
      if (user?.id) {
        newSocket.emit('join', user.id);
        console.log('📡 Joined room:', user.id);
      }

      // Show connection toast
      toast.success('🔔 Real-time alerts enabled', {
        duration: 2000,
        position: 'bottom-right'
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        newSocket.connect();
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      reconnectAttempts.current++;
      
      if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
        toast.error('Failed to connect to real-time alerts', {
          duration: 3000,
          position: 'bottom-right'
        });
      }
    });

    // Listen for weather alerts
    newSocket.on('weather-alert', (alert) => {
      console.log('🔔 Received weather alert:', alert);
      
      // Map alert types to icons
      const iconMap = {
        rain: '🌧️',
        temp_high: '🔥',
        temp_low: '❄️',
        aqi: '😷',
        wind: '💨'
      };

      const icon = iconMap[alert.type] || '⚠️';

      // Show toast notification
      const severityColor = alert.severity === 'high' ? 'bg-red-500/90' : 
                            alert.severity === 'medium' ? 'bg-orange-500/90' : 
                            'bg-blue-500/90';
      
      toast(`${icon} ${alert.city}: ${alert.message}`, {
        duration: 6000,
        position: 'top-right',
        style: {
          background: severityColor,
          color: 'white',
        }
      });

      // Browser notification (if permission granted)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`${icon} Weather Alert`, {
          body: `${alert.city}: ${alert.message}`,
          icon: '/weather-icon.png',
          badge: '/badge.png',
          tag: `alert-${alert.id}`,
          requireInteraction: alert.severity === 'high'
        });
      }

      // Save to alerts store
      addAlert(alert);

      // Play alert sound (optional)
      try {
        const audio = new Audio('/alert-sound.mp3');
        audio.volume = 0.5;
        audio.play().catch(console.error);
      } catch (error) {
        console.error('Failed to play alert sound:', error);
      }
    });

    // Listen for test alerts (for demo purposes)
    newSocket.on('test-alert', (data) => {
      console.log('');
      console.log('═══════════════════════════════════════');
      console.log('🧪 TEST ALERT RECEIVED FROM SERVER');
      console.log('═══════════════════════════════════════');
      console.log('Data:', data);
      
      // Show toast notification IN the app
      toast('🧪 Server response received! Creating browser notification...', { 
        icon: '📥',
        duration: 4000,
        position: 'top-right'
      });
      
      // Show BROWSER notification (appears OUTSIDE browser window)
      if ('Notification' in window) {
        console.log('Notification API available:', true);
        console.log('Current permission:', Notification.permission);
        
        if (Notification.permission === 'granted') {
          console.log('Creating BROWSER notification...');
          console.log('This should appear in Windows notification center!');
          
          try {
            const browserNotification = new Notification('🧪 Weather Alert Test - FROM SERVER', {
              body: `✅ SUCCESS!\n\nThis is a REAL browser notification triggered by the server via WebSocket.\n\nMessage: ${data.message || 'Test alert'}\nTime: ${new Date().toLocaleTimeString()}`,
              icon: '/pwa-192x192.png',
              badge: '/pwa-192x192.png',
              tag: 'websocket-test-alert',
              requireInteraction: true, // Stays visible until clicked
              vibrate: [200, 100, 200],
              silent: false
            });
            
            browserNotification.onclick = () => {
              console.log('✅ User clicked the WebSocket test browser notification!');
              window.focus();
            };
            
            console.log('✅ BROWSER notification created:', browserNotification);
            console.log('✅ Check Windows notification area (bottom-right corner)!');
          } catch (error) {
            console.error('❌ Failed to create browser notification:', error);
          }
        } else {
          console.log('⚠️ Browser notification permission NOT granted');
          console.log('   Current permission:', Notification.permission);
          console.log('   Click "Enable Browser Notifications" button first!');
          
          toast.error('⚠️ Browser notifications not enabled. Click "Enable Browser Notifications" button!', {
            duration: 6000
          });
        }
      } else {
        console.error('❌ Notification API not available in this browser');
      }
      
      console.log('═══════════════════════════════════════');
      console.log('');
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log('🔌 Disconnecting WebSocket...');
      newSocket.close();
      setSocket(null);
      setIsConnected(false);
    };
  }, [isAuthenticated, user, addAlert]);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  };

  // Send test alert (for development)
  const sendTestAlert = () => {
    console.log('🧪 sendTestAlert called');
    console.log('  - socket:', socket ? 'connected' : 'null');
    console.log('  - isConnected:', isConnected);
    console.log('  - Notification.permission:', 'Notification' in window ? Notification.permission : 'N/A');
    
    if (!socket || !isConnected) {
      toast.error('Not connected to server');
      return;
    }
    
    // Check notification permission
    if ('Notification' in window && Notification.permission !== 'granted') {
      toast('⚠️ Browser notifications not enabled. Click "Enable Notifications" first!', {
        duration: 5000,
        icon: '⚠️'
      });
    }
    
    // Send test event to server
    socket.emit('test', { message: 'Test from client', timestamp: new Date().toISOString() });
    toast('🧪 Test alert sent to server...', { icon: '📤', duration: 2000 });
    console.log('📤 Test alert emitted to server');
  };

  return {
    socket,
    isConnected,
    requestNotificationPermission,
    sendTestAlert
  };
};
