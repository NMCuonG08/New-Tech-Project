// Chat Service - Gọi API chat với backend

import apiClient from '../configs/apiClient';

/**
 * Gửi message đến AI chat
 * @param {string} message - Message từ user
 * @param {string} sessionId - Session ID (optional, sẽ tự generate nếu không có)
 * @returns {Promise<Object>} Response từ AI (includes sessionId)
 */
export async function sendChatMessage(message, sessionId = null) {
    try {
        const response = await apiClient.post('/ai/chat', {
            message,
            sessionId,
        });
        return response.data;
    } catch (error) {
        console.error('Error sending chat message:', error);
        throw error;
    }
}

/**
 * Lấy context của session
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Context data
 */
export async function getChatContext(sessionId) {
    try {
        const response = await apiClient.get(`/ai/context/${sessionId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting chat context:', error);
        throw error;
    }
}

/**
 * Xóa context của session
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Response
 */
export async function clearChatContext(sessionId) {
    try {
        const response = await apiClient.delete(`/ai/context/${sessionId}`);
        return response.data;
    } catch (error) {
        console.error('Error clearing chat context:', error);
        throw error;
    }
}

/**
 * Lấy tất cả sessions của user hiện tại (requires authentication)
 * @returns {Promise<Object>} List of sessions
 */
export async function getUserSessions() {
    try {
        const response = await apiClient.get('/chat/sessions');
        return response.data;
    } catch (error) {
        console.error('Error getting user sessions:', error);
        throw error;
    }
}

/**
 * Lấy tất cả messages trong một session
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} List of messages
 */
export async function getSessionMessages(sessionId) {
    try {
        const response = await apiClient.get(`/chat/sessions/${sessionId}/messages`);
        return response.data;
    } catch (error) {
        console.error('Error getting session messages:', error);
        throw error;
    }
}

/**
 * Tạo session mới
 * @returns {Promise<Object>} New session data
 */
export async function createNewSession() {
    try {
        const response = await apiClient.post('/chat/sessions');
        return response.data;
    } catch (error) {
        console.error('Error creating new session:', error);
        throw error;
    }
}

/**
 * Xóa một session
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Response
 */
export async function deleteSession(sessionId) {
    try {
        const response = await apiClient.delete(`/chat/sessions/${sessionId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting session:', error);
        throw error;
    }
}

