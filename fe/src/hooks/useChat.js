// Chat Hook - Quản lý state và logic chat

import { useState, useCallback, useRef, useEffect } from 'react';
import { sendChatMessage, getSessionMessages } from '../services/chatService';
import { setCurrentSessionId } from '../utils/chatUtils';

export function useChat(initialSessionId) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sessionId, setSessionId] = useState(initialSessionId);
    const messagesEndRef = useRef(null);

    // Auto scroll to bottom when new message
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Load messages when session changes
    useEffect(() => {
        if (!sessionId) {
            setMessages([]);
            return;
        }

        // Always try to load messages from backend
        // For new sessions that don't exist yet, it will just clear messages
        loadSessionMessages(sessionId);
    }, [sessionId]);

    // Load messages from backend
    const loadSessionMessages = useCallback(async (sid) => {
        try {
            const response = await getSessionMessages(sid);
            const serverMessages = response.messages || [];

            // Convert backend messages to frontend format
            const formattedMessages = serverMessages.map((msg) => ({
                id: `msg-${msg.id}`,
                type: msg.role === 'user' ? 'user' : 'ai',
                content: msg.content,
                timestamp: msg.createdAt,
            }));

            setMessages(formattedMessages);
        } catch (err) {
            console.error('Error loading session messages:', err);
            // If error (e.g., session not found), start fresh
            setMessages([]);
        }
    }, []);

    // Send message
    const sendMessage = useCallback(async (message) => {
        if (!message || !message.trim()) {
            return;
        }

        const userMessage = {
            id: `msg-${Date.now()}-user`,
            type: 'user',
            content: message.trim(),
            timestamp: new Date().toISOString(),
        };

        // Add user message immediately
        setMessages((prev) => [...prev, userMessage]);
        setLoading(true);
        setError(null);

        try {
            const response = await sendChatMessage(message, sessionId);

            // Update sessionId if backend returns one (for new sessions)
            if (response.sessionId && response.sessionId !== sessionId) {
                setSessionId(response.sessionId);
                setCurrentSessionId(response.sessionId);
            }

            const aiMessage = {
                id: `msg-${Date.now()}-ai`,
                type: 'ai',
                content: response.response || response.message || 'Không có phản hồi',
                timestamp: new Date().toISOString(),
                data: response,
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (err) {
            console.error('Chat error:', err);

            // Handle expired token - clear it
            if (err.response?.status === 401) {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('access_token');
                console.warn('Token expired - cleared from storage');
            }

            const errorMessage = {
                id: `msg-${Date.now()}-error`,
                type: 'error',
                content: err.response?.data?.message || err.message || 'Có lỗi xảy ra khi gửi tin nhắn',
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, errorMessage]);
            setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra');

            // DO NOT set sessionId from error - keep the current valid sessionId
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    // Clear chat (local only)
    const clearChat = useCallback(() => {
        setMessages([]);
        setError(null);
    }, []);

    // Switch to different session
    const switchToSession = useCallback((newSessionId) => {
        setSessionId(newSessionId);
        setCurrentSessionId(newSessionId);
    }, []);

    return {
        messages,
        loading,
        error,
        sessionId,
        sendMessage,
        clearChat,
        messagesEndRef,
        switchToSession,
    };
}

