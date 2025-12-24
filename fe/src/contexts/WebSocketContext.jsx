import { createContext, useContext, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../hooks/useAuth';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const ws = useWebSocket();

    // Auto reconnect when user logs in
    useEffect(() => {
        if (isAuthenticated && !ws.isConnected) {
            ws.connect();
        } else if (!isAuthenticated && ws.isConnected) {
            ws.disconnect();
        }
    }, [isAuthenticated, ws]);

    return (
        <WebSocketContext.Provider value={ ws }>
            { children }
        </WebSocketContext.Provider>
    );
}

export function useWebSocketContext() {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocketContext must be used within WebSocketProvider');
    }
    return context;
}
