const WEATHER_SYNC_TAG = 'weather-sync-refresh'

self.addEventListener('push', (event) => {
    let payload = {}
    try {
        payload = event.data ? event.data.json() : {}
    } catch (error) {
        console.error('Push payload parse error:', error)
    }

    const title = payload.title || 'Weather PWA'
    const options = {
        body: payload.message || payload.body || '',
        icon: payload.icon || '/pwa-192x192.png',
        data: payload.data || {},
    }

    event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    const targetUrl = event.notification.data?.url || '/'

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            for (const client of clients) {
                if (client.url.includes(self.location.origin)) {
                    client.postMessage({
                        type: 'notification-click',
                        data: event.notification.data,
                    })
                    return client.focus()
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(targetUrl)
            }
            return null
        })
    )
})

self.addEventListener('sync', (event) => {
    if (event.tag !== WEATHER_SYNC_TAG) {
        return
    }

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            if (!clients.length) {
                return
            }

            clients.forEach((client) => {
                client.postMessage({
                    type: 'weather-sync-refresh',
                    timestamp: Date.now(),
                })
            })
        })
    )
})
