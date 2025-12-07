// Chat Hook - Quản lý state và logic chat

import { useState, useCallback, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/chatService';
import { getOrCreateSessionId, formatChatTime } from '../utils/chatUtils';

export function useChat() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sessionId] = useState(() => getOrCreateSessionId());
    const messagesEndRef = useRef(null);

    // Auto scroll to bottom when new message
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

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

            const aiMessage = {
                id: `msg-${Date.now()}-ai`,
                type: 'ai',
                content: response.response || response.message || 'Không có phản hồi',
                timestamp: new Date().toISOString(),
                data: response,
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (err) {
            const errorMessage = {
                id: `msg-${Date.now()}-error`,
                type: 'error',
                content: err.response?.data?.message || err.message || 'Có lỗi xảy ra khi gửi tin nhắn',
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, errorMessage]);
            setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    // Clear chat
    const clearChat = useCallback(() => {
        setMessages([]);
        setError(null);
    }, []);

    return {
        messages,
        loading,
        error,
        sessionId,
        sendMessage,
        clearChat,
        messagesEndRef,
    };
}

