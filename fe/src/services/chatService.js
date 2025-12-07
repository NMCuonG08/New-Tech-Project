// Chat Service - Gọi API chat với backend

import apiClient from '../configs/apiClient';

/**
 * Gửi message đến AI chat
 * @param {string} message - Message từ user
 * @param {string} sessionId - Session ID (optional, sẽ tự generate nếu không có)
 * @returns {Promise<Object>} Response từ AI
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

