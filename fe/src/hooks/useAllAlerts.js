import { useState, useEffect, useCallback } from 'react';
import { alertService } from '../services/alertService';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'system_notifications';

export function useAllAlerts() {
    const [userAlerts, setUserAlerts] = useState([]);
    const [systemNotifications, setSystemNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load system notifications from localStorage
    useEffect(() => {
        const loadSystemNotifications = () => {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    console.log('📦 Loaded system notifications:', parsed.length);
                    setSystemNotifications(parsed);
                }
            } catch (error) {
                console.error('Error loading system notifications:', error);
            }
        };

        loadSystemNotifications();
    }, []);

    // Save system notifications to localStorage
    useEffect(() => {
        if (systemNotifications.length >= 0) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(systemNotifications));
                console.log('💾 Saved system notifications:', systemNotifications.length);
            } catch (error) {
                console.error('Error saving system notifications:', error);
            }
        }
    }, [systemNotifications]);

    // Fetch user alerts from API
    const fetchUserAlerts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('🔄 Fetching user alerts...');
            const alerts = await alertService.getUserAlerts();
            console.log('✅ Fetched user alerts:', alerts.length);
            setUserAlerts(alerts);
        } catch (err) {
            console.error('❌ Error fetching user alerts:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch system alerts from backend
    const fetchSystemAlerts = useCallback(async () => {
        try {
            console.log('🔄 Fetching system alerts from backend...');
            const alerts = await alertService.getActiveSystemAlerts();
            console.log('✅ Fetched system alerts from backend:', alerts.length);

            // Merge with localStorage (keep read status from localStorage)
            setSystemNotifications(prev => {
                const merged = alerts.map(backendAlert => {
                    const localAlert = prev.find(p => p.id === backendAlert.id);
                    return {
                        ...backendAlert,
                        type: 'SYSTEM',
                        isRead: localAlert?.isRead || false,
                        receivedAt: localAlert?.receivedAt || backendAlert.createdAt,
                    };
                });
                console.log('📦 Merged system alerts:', merged.length);
                return merged;
            });
        } catch (error) {
            console.error('❌ Error fetching system alerts:', error);
        }
    }, []);

    // Add system notification from WebSocket
    const addSystemNotification = useCallback((notification) => {
        setSystemNotifications(prev => {
            // Check duplicate
            const exists = prev.some(n => n.id === notification.id);
            if (exists) {
                console.log('⚠️ Duplicate notification prevented:', notification.id);
                return prev;
            }

            console.log('➕ Adding system notification:', notification.id);
            const newNotification = {
                ...notification,
                type: 'SYSTEM',
                isRead: false,
                receivedAt: new Date().toISOString(),
            };

            // Show toast
            const toastId = `alert-${notification.id}`;
            switch (notification.severity) {
                case 'critical':
                    toast.error(`🚨 ${notification.title}\n${notification.message}`, {
                        id: toastId,
                        duration: 10000,
                    });
                    break;
                case 'danger':
                    toast.error(`⚠️ ${notification.title}\n${notification.message}`, {
                        id: toastId,
                        duration: 5000,
                    });
                    break;
                case 'warning':
                    toast(`⚠️ ${notification.title}\n${notification.message}`, {
                        id: toastId,
                        icon: '⚠️',
                        duration: 5000,
                    });
                    break;
                default:
                    toast(`ℹ️ ${notification.title}\n${notification.message}`, {
                        id: toastId,
                        icon: 'ℹ️',
                        duration: 5000,
                    });
            }

            return [newNotification, ...prev];
        });
    }, []);

    // Mark system notification as read
    const markAsRead = useCallback((id) => {
        setSystemNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
    }, []);

    // Mark all as read
    const markAllAsRead = useCallback(() => {
        setSystemNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        toast.success('All notifications marked as read');
    }, []);

    // Delete system notification
    const deleteSystemNotification = useCallback((id) => {
        setSystemNotifications(prev => prev.filter(n => n.id !== id));
        toast.success('Notification deleted');
    }, []);

    // Delete user alert
    const deleteUserAlert = useCallback(async (id) => {
        try {
            await alertService.deleteAlert(id);
            setUserAlerts(prev => prev.filter(a => a.id !== id));
            toast.success('Alert deleted');
        } catch (error) {
            console.error('Error deleting alert:', error);
            toast.error('Failed to delete alert');
        }
    }, []);

    // Clear all system notifications
    const clearAllSystemNotifications = useCallback(() => {
        setSystemNotifications([]);
        localStorage.removeItem(STORAGE_KEY);
        toast.success('All system notifications cleared');
    }, []);

    // Merge and sort all alerts
    const allAlerts = [
        ...systemNotifications.map(n => ({ ...n, source: 'SYSTEM' })),
        ...userAlerts.map(a => ({ ...a, source: 'USER', receivedAt: a.createdAt })),
    ].sort((a, b) => new Date(b.receivedAt || b.createdAt) - new Date(a.receivedAt || a.createdAt));

    const unreadCount = systemNotifications.filter(n => !n.isRead).length;

    return {
        // Data
        userAlerts,
        systemNotifications,
        allAlerts,
        loading,
        error,
        unreadCount,

        // Actions
        fetchUserAlerts,
        fetchSystemAlerts,
        addSystemNotification,
        markAsRead,
        markAllAsRead,
        deleteSystemNotification,
        deleteUserAlert,
        clearAllSystemNotifications,
    };
}
