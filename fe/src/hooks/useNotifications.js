// useNotifications hook - Manage browser notifications

import { useState, useEffect, useCallback } from 'react';
import {
    requestNotificationPermission,
    sendTestNotification,
    showNotification,
    showWeatherAlert
} from '../services/notificationService';

export function useNotifications() {
    const [permission, setPermission] = useState(
        typeof Notification !== 'undefined' ? Notification.permission : 'denied'
    );

    const askPermission = useCallback(async () => {
        const result = await requestNotificationPermission();
        setPermission(result);
        return result;
    }, []);

    useEffect(() => {
        // Auto-request permission on mount if still default
        if (permission === 'default') {
            askPermission();
        }
    }, []);

    const sendTestPush = useCallback((payload) => {
        if (permission !== 'granted') {
            throw new Error('Notification permission not granted');
        }
        return sendTestNotification(payload.title, payload.message);
    }, [permission]);

    return {
        permission,
        askPermission,
        sendTestPush,
        showNotification,
        showWeatherAlert,
    };
}

