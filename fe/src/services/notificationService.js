// Notification Service - Browser notifications for weather alerts

/**
 * Request notification permission from the browser
 */
export async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return 'denied';
    }
    
    if (Notification.permission !== 'default') {
        return Notification.permission;
    }
    
    return await Notification.requestPermission();
}

/**
 * Show a browser notification
 */
export function showNotification(title, options = {}) {
    if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return null;
    }

    if (Notification.permission !== 'granted') {
        console.warn('Notification permission not granted');
        return null;
    }

    const defaultOptions = {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        vibrate: [200, 100, 200],
        requireInteraction: false,
        ...options
    };

    return new Notification(title, defaultOptions);
}

/**
 * Show a weather alert notification
 */
export function showWeatherAlert(alertData) {
    const { type, city, temperature, threshold, condition } = alertData;
    
    let title = 'Weather Alert';
    let body = '';
    let icon = '/pwa-192x192.png';

    switch(type) {
        case 'temperature_high':
            title = `🌡️ High Temperature Alert`;
            body = `${city}: ${temperature}°C (Threshold: ${threshold}°C)`;
            break;
        case 'temperature_low':
            title = `❄️ Low Temperature Alert`;
            body = `${city}: ${temperature}°C (Threshold: ${threshold}°C)`;
            break;
        case 'rain':
            title = `🌧️ Rain Alert`;
            body = `Rain expected in ${city}`;
            break;
        case 'wind':
            title = `💨 Wind Alert`;
            body = `High wind speed in ${city}`;
            break;
        case 'aqi':
            title = `😷 Air Quality Alert`;
            body = `Poor air quality in ${city}`;
            break;
        case 'humidity':
            title = `💧 Humidity Alert`;
            body = `High humidity in ${city}`;
            break;
        default:
            body = `Weather alert for ${city}`;
    }

    if (condition) {
        body += ` - ${condition}`;
    }

    return showNotification(title, {
        body,
        icon,
        tag: `weather-alert-${type}-${city}`,
        data: { type: 'weather-alert', ...alertData }
    });
}

/**
 * Test notification
 */
export function sendTestNotification(title = 'Weather PWA', message = 'Test notification') {
    return showNotification(title, {
        body: message,
        tag: 'test-notification'
    });
}

