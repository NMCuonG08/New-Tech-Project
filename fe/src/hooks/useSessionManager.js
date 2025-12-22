// Session Manager Hook - Quản lý sessions

import { useState, useCallback, useEffect, useRef } from 'react';
import {
    getUserSessions,
    createNewSession as createNewSessionAPI,
    deleteSession as deleteSessionAPI,
} from '../services/chatService';
import {
    getCurrentSessionId,
    setCurrentSessionId,
    getAllSessions,
    saveSessions,
    generateUUID,
} from '../utils/chatUtils';

export function useSessionManager() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Check if user is authenticated
    const isAuthenticated = !!localStorage.getItem('auth_token');

    // Initialize currentSessionId - create one if doesn't exist
    const [currentSessionId, setCurrentSessionIdState] = useState(() => {
        let sessionId = getCurrentSessionId();
        if (!sessionId) {
            // Create new UUID session for first time users
            sessionId = generateUUID();
            setCurrentSessionId(sessionId);

            // Add to localStorage for anonymous users
            if (!localStorage.getItem('auth_token')) {
                const newSession = {
                    id: sessionId,
                    title: 'New Chat',
                    messageCount: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isAnonymous: true,
                };
                saveSessions([newSession]);
            }
        }
        return sessionId;
    });

    // Load sessions on mount
    useEffect(() => {
        if (isAuthenticated) {
            loadUserSessions();
        } else {
            // Load from localStorage for anonymous users
            const localSessions = getAllSessions();
            setSessions(localSessions);
        }
    }, [isAuthenticated]);

    // Load user sessions from backend
    const loadUserSessions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getUserSessions();
            const serverSessions = response.sessions || [];
            setSessions(serverSessions);
            saveSessions(serverSessions);
        } catch (err) {
            console.error('Error loading sessions:', err);
            setError(err.message);
            // Fallback to localStorage
            const localSessions = getAllSessions();
            setSessions(localSessions);
        } finally {
            setLoading(false);
        }
    }, []);

    // Switch to a different session
    const switchSession = useCallback((sessionId) => {
        setCurrentSessionId(sessionId);
        setCurrentSessionIdState(sessionId);
    }, []);

    // Create new session
    const createNewSession = useCallback(async () => {
        try {
            if (isAuthenticated) {
                const response = await createNewSessionAPI();
                const newSessionId = response.sessionId;

                // Reload sessions
                await loadUserSessions();

                // Switch to new session
                switchSession(newSessionId);

                return newSessionId;
            } else {
                // For anonymous users, just generate a new session ID
                // The backend will create it on first message
                const { generateUUID } = await import('../utils/chatUtils');
                const newSessionId = generateUUID();

                // Add to local sessions
                const newSession = {
                    id: newSessionId,
                    title: 'New Chat',
                    messageCount: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isAnonymous: true,
                };

                const updatedSessions = [newSession, ...sessions];
                setSessions(updatedSessions);
                saveSessions(updatedSessions);

                // Switch to new session
                switchSession(newSessionId);

                return newSessionId;
            }
        } catch (err) {
            console.error('Error creating new session:', err);
            setError(err.message);
            return null;
        }
    }, [isAuthenticated, sessions, loadUserSessions, switchSession]);

    // Delete a session
    const deleteSession = useCallback(async (sessionId) => {
        try {
            if (isAuthenticated) {
                await deleteSessionAPI(sessionId);
                await loadUserSessions();
            } else {
                // Delete from localStorage
                const updatedSessions = sessions.filter(s => s.id !== sessionId);
                setSessions(updatedSessions);
                saveSessions(updatedSessions);
            }

            // If deleted current session, switch to another or create new
            if (sessionId === currentSessionId) {
                const remainingSessions = sessions.filter(s => s.id !== sessionId);
                if (remainingSessions.length > 0) {
                    switchSession(remainingSessions[0].id);
                } else {
                    await createNewSession();
                }
            }

            return true;
        } catch (err) {
            console.error('Error deleting session:', err);
            setError(err.message);
            return false;
        }
    }, [isAuthenticated, sessions, currentSessionId, loadUserSessions, switchSession, createNewSession]);

    // Detect when user logs in - clear anonymous session and create new one
    const previousAuthRef = useRef(isAuthenticated);
    useEffect(() => {
        const wasAnonymous = !previousAuthRef.current;
        const isNowAuthenticated = isAuthenticated;

        if (wasAnonymous && isNowAuthenticated) {
            console.log('🔄 User logged in - resetting session');

            // Clear old anonymous session
            localStorage.removeItem('chat-current-session');
            localStorage.removeItem('chat-sessions');

            // Create new session for logged-in user
            createNewSession().then((newSessionId) => {
                console.log('✅ Created new user session:', newSessionId);
            });
        }

        previousAuthRef.current = isAuthenticated;
    }, [isAuthenticated, createNewSession]);

    return {
        sessions,
        currentSessionId,
        loading,
        error,
        switchSession,
        createNewSession,
        deleteSession,
        refreshSessions: loadUserSessions,
    };
}
