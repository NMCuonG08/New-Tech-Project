// Notification Service - Push notifications cho weather alerts

const PUSH_SERVER_URL = import.meta.env.VITE_PUSH_SERVER_URL || 'http://localhost:4000'

const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/'
    )
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; i += 1) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

export async function requestNotificationPermission() {
    if (!('Notification' in window)) return 'denied'
    if (Notification.permission !== 'default') return Notification.permission
    return Notification.requestPermission()
}

export async function subscribeToPushNotifications() {
    const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
    if (!publicKey) throw new Error('Missing VAPID public key')

    const registration = await navigator.serviceWorker.ready
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
        })
    }

    await fetch(`${PUSH_SERVER_URL}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
    })

    return subscription
}

export async function sendServerTestPush(payload) {
    const response = await fetch(`${PUSH_SERVER_URL}/send-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        throw new Error('Failed to send push notification')
    }

    return response.json()
}

