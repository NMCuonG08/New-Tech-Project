// Chat Utilities

/**
 * Generate UUID v4
 * @returns {string} UUID
 */
export function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Generate unique session ID (for backward compatibility)
 * @returns {string} Session ID
 */
export function generateSessionId() {
    return generateUUID();
}

/**
 * Get current active session ID from localStorage
 * @returns {string|null} Current session ID
 */
export function getCurrentSessionId() {
    return localStorage.getItem('chat-current-session');
}

/**
 * Set current active session ID
 * @param {string} sessionId - Session ID to set as current
 */
export function setCurrentSessionId(sessionId) {
    localStorage.setItem('chat-current-session', sessionId);
}

/**
 * Get all sessions from localStorage (as backup/cache)
 * @returns {Array} Array of session objects
 */
export function getAllSessions() {
    try {
        const sessionsJson = localStorage.getItem('chat-sessions');
        return sessionsJson ? JSON.parse(sessionsJson) : [];
    } catch (error) {
        console.error('Error parsing sessions from localStorage:', error);
        return [];
    }
}

/**
 * Save sessions to localStorage
 * @param {Array} sessions - Array of session objects
 */
export function saveSessions(sessions) {
    try {
        localStorage.setItem('chat-sessions', JSON.stringify(sessions));
    } catch (error) {
        console.error('Error saving sessions to localStorage:', error);
    }
}

/**
 * Get or create session ID from localStorage (legacy support)
 * @returns {string} Session ID
 */
export function getOrCreateSessionId() {
    let sessionId = getCurrentSessionId();

    if (!sessionId) {
        sessionId = generateUUID();
        setCurrentSessionId(sessionId);
    }

    return sessionId;
}

/**
 * Format timestamp for chat messages
 * @param {Date|string|number} timestamp
 * @returns {string} Formatted time
 */
export function formatChatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // Less than 1 minute
    if (diff < 60000) {
        return 'Vừa xong';
    }

    // Less than 1 hour
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} phút trước`;
    }

    // Today
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return `Hôm qua ${date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        })}`;
    }

    // Older
    return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Scroll to bottom of chat container
 * @param {HTMLElement} container
 */
export function scrollToBottom(container) {
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}

