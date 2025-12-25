import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';

export function useWebSocket() {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const reconnectTimeoutRef = useRef();

  const connect = useCallback(() => {
    const token = localStorage.getItem('auth_token');

    if (!token || socketRef.current?.connected) {
      return;
    }

    console.log('🔌 Connecting to WebSocket...', SOCKET_URL);

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket connected:', socket.id);
      setIsConnected(true);
      toast.success('Kết nối real-time thành công', {
        id: 'ws-connect',
        duration: 2000,
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      setIsConnected(false);

      if (reason === 'io client disconnect') {
        // Manual disconnect, don't show error
        return;
      }

      toast.error('Mất kết nối real-time', {
        id: 'ws-disconnect',
        duration: 2000,
      });
    });

    socket.on('connect_error', (error) => {
      console.error('🔴 WebSocket connection error:', error.message);
      setIsConnected(false);
      
      // Check if it's an authentication error (expired token)
      if (error.message.includes('Authentication error') || error.message.includes('Invalid token')) {
        console.warn('⚠️ WebSocket authentication failed - token may be expired');
        // Clear expired token
        localStorage.removeItem('auth_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('auth_user');
        
        // Redirect to login if not already there
        if (!window.location.pathname.includes('/auth/')) {
          toast.error('Session expired. Please login again.', { id: 'ws-auth-error' });
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 1500);
        }
      }
    });

    socket.on('pong', () => {
      // Keep-alive response
    });

    // Listen for system alerts - CHỈ dispatch event, KHÔNG hiển thị toast
    socket.on('system_alert', (data) => {
      console.log('📢 WebSocket: System Alert received:', data);

      // CHỈ dispatch custom event cho components listen
      // KHÔNG show toast ở đây để tránh duplicate
      window.dispatchEvent(new CustomEvent('system_alert', { detail: data }));
    });

    socketRef.current = socket;

    // Ping every 30 seconds to keep connection alive
    const pingInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('ping');
      }
    }, 30000);

    // Cleanup function để tránh duplicate listeners
    return () => {
      console.log('🧹 Cleaning up WebSocket listeners');
      clearInterval(pingInterval);
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.off('pong');
        socket.off('system_alert');
      }
    };
  }, []);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('🔌 Disconnecting WebSocket...');
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Send event to server
  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('⚠️ Cannot emit, socket not connected');
    }
  }, []);

  // Subscribe to custom events
  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  // Unsubscribe from custom events
  const off = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  // Auto-connect when component mounts if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      connect();
    }

    return () => {
      disconnect();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    onlineUsers,
    connect,
    disconnect,
    emit,
    on,
    off,
    socket: socketRef.current,
  };
}
