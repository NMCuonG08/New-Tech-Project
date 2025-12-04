// useNotifications hook - Quản lý notifications

import { useState, useEffect, useCallback } from 'react'
import {
    requestNotificationPermission,
    subscribeToPushNotifications,
    sendServerTestPush,
} from '../services/notificationService'

export function useNotifications() {
    const [permission, setPermission] = useState(Notification.permission)

    const askPermission = useCallback(async () => {
        const result = await requestNotificationPermission()
        setPermission(result)
        return result
    }, [])

    useEffect(() => {
        async function ensurePermissionAndSubscribe() {
            if (permission === 'granted') {
                try {
                    await subscribeToPushNotifications()
                    console.log('🔔 Auto subscribed to push server')
                } catch (error) {
                    console.error('Subscribe push failed:', error)
                }
            } else if (permission === 'default') {
                const result = await askPermission()
                if (result === 'granted') {
                    try {
                        await subscribeToPushNotifications()
                        console.log('🔔 Auto subscribed to push server')
                    } catch (error) {
                        console.error('Subscribe push failed:', error)
                    }
                }
            }
        }

        ensurePermissionAndSubscribe()
    }, [permission, askPermission])

    return {
        permission,
        sendServerTestPush,
    }
}

