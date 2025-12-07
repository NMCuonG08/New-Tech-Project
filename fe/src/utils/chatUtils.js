// Chat Utilities

/**
 * Generate unique session ID
 * @returns {string} Session ID
 */
export function generateSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get or create session ID from localStorage
 * @returns {string} Session ID
 */
export function getOrCreateSessionId() {
    const key = 'chat-session-id';
    let sessionId = localStorage.getItem(key);

    if (!sessionId) {
        sessionId = generateSessionId();
        localStorage.setItem(key, sessionId);
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

