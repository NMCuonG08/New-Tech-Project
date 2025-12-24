# Alert System Debugging Guide

## Issues Fixed

1. **Wind Speed Conversion Issue**: Fixed the wind speed calculation to properly return converted km/h value instead of m/s
2. **Enhanced Logging**: Added comprehensive logging throughout the alert checking process
3. **WebSocket Room Monitoring**: Added logging to track which users are connected to their rooms
4. **Test Endpoints**: Added endpoints to manually test alerts and WebSocket connectivity

## Testing Steps

### Step 1: Verify Backend is Running
```bash
cd be
npm run dev
```

Check the console for:
- ✅ "Data Source has been initialized"
- ✅ "Alert monitoring started"
- ✅ "WebSocket service initialized"

### Step 2: Create a Test Alert

Use Postman or curl to create an alert:

```bash
POST http://localhost:3000/api/alerts
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "locationId": 1,
  "type": "temperature_high",
  "threshold": 25,
  "description": "Alert when temperature exceeds 25°C"
}
```

### Step 3: Test WebSocket Connection

1. Open your frontend application
2. Make sure the user is authenticated
3. Check browser console for WebSocket connection:
   - Look for: "Client connected"
   - Look for: "User X joined room"

### Step 4: Send a Test Alert

```bash
POST http://localhost:3000/api/alerts/test
Authorization: Bearer YOUR_TOKEN
```

This will send a test alert via WebSocket. Check:
- Backend console: Should show "Emitting alert to user X"
- Backend console: Should show "Room 'user_X' has N connected client(s)"
- Frontend: Should receive the alert notification

### Step 5: Manually Check All Alerts

```bash
POST http://localhost:3000/api/alerts/check-all
Authorization: Bearer YOUR_TOKEN
```

This will:
- Manually trigger alert checking for all active alerts
- Return which alerts were triggered
- Send WebSocket notifications for triggered alerts

Check backend console for:
- "Checking N alerts for location: CITY_NAME"
- "Evaluating alert #X: type=..., threshold=..."
- "Result: triggered=true/false, value=..."
- "Alert triggered: ..." (if any alert is triggered)

### Step 6: Check Specific Location Alerts

```bash
POST http://localhost:3000/api/alerts/check/:locationId
Authorization: Bearer YOUR_TOKEN
```

This checks alerts for a specific location.

## Common Issues & Solutions

### Issue 1: No Alerts Being Triggered

**Symptoms:**
- Backend logs show "Result: triggered=false"
- No alerts are sent to frontend

**Possible Causes:**
1. Alert threshold is not met by current weather conditions
2. Weather data is not being fetched properly
3. Alert is not active (isActive = false)

**Solution:**
- Check the backend logs for weather data values
- Adjust alert thresholds to match current conditions
- Verify alert is active: `GET /api/alerts` and check `isActive: true`

### Issue 2: WebSocket Not Connected

**Symptoms:**
- Backend logs show "Room 'user_X' has 0 connected client(s)"
- Test alert doesn't reach frontend

**Possible Causes:**
1. Frontend not connecting to WebSocket
2. User not joining their room
3. CORS issues

**Solution:**
- Check frontend console for WebSocket connection errors
- Verify frontend is calling `socket.emit('join', userId)`
- Check CORS settings in backend index.ts match frontend URL

### Issue 3: Alerts Sent But Not Displayed

**Symptoms:**
- Backend logs show "Emitting alert to user X"
- Backend logs show "Room 'user_X' has 1 connected client(s)"
- No notification appears in browser

**Possible Causes:**
1. Frontend not listening to 'weather-alert' event
2. Browser notification permissions not granted
3. Frontend notification handler has errors

**Solution:**
- Check frontend code for: `socket.on('weather-alert', handler)`
- Check browser notification permissions
- Check frontend console for JavaScript errors

### Issue 4: Alert Cooldown Period

**Note:** Alerts have a 30-minute cooldown period to prevent spam. If an alert was recently triggered, it won't trigger again for 30 minutes.

**Solution:**
- Wait 30 minutes
- Or restart the backend server (clears cooldown cache)

## Monitoring Commands

### View All User Alerts
```bash
GET http://localhost:3000/api/alerts
Authorization: Bearer YOUR_TOKEN
```

### View Alert by ID
```bash
GET http://localhost:3000/api/alerts/:id
Authorization: Bearer YOUR_TOKEN
```

### View Alerts for Location
```bash
GET http://localhost:3000/api/alerts/location/:locationId
Authorization: Bearer YOUR_TOKEN
```

## Backend Logs to Monitor

When alert checking runs (every 5 minutes), you should see:
```
Checking N active alerts...
Checking M alerts for location: CITY_NAME
Weather data fetched for CITY_NAME: { temp: X, humidity: Y, ... }
  Evaluating alert #1: type=temperature_high, threshold=30
  Result: triggered=false, value=25.5
```

When an alert triggers:
```
🚨 Alert triggered: temperature_high for London - Value: 32.5, Threshold: 30
📤 Sending alert to user 123 via WebSocket: { ... }
   Room 'user_123' has 1 connected client(s)
```

## Frontend Integration Checklist

Ensure your frontend has:

1. **WebSocket Connection**
   ```javascript
   const socket = io('http://localhost:3000', {
     withCredentials: true,
     transports: ['websocket', 'polling']
   });
   ```

2. **Room Joining**
   ```javascript
   socket.emit('join', userId);
   ```

3. **Alert Listener**
   ```javascript
   socket.on('weather-alert', (alert) => {
     console.log('Received alert:', alert);
     // Show browser notification
     // Update UI
   });
   ```

4. **Browser Notifications Permission**
   ```javascript
   if ('Notification' in window && Notification.permission !== 'granted') {
     Notification.requestPermission();
   }
   ```

## Quick Test Script

Save this as `test-alerts.sh` and run to test all endpoints:

```bash
#!/bin/bash
TOKEN="YOUR_AUTH_TOKEN"
BASE_URL="http://localhost:3000/api/alerts"

echo "1. Get all alerts"
curl -X GET "$BASE_URL" -H "Authorization: Bearer $TOKEN"

echo "\n\n2. Send test alert"
curl -X POST "$BASE_URL/test" -H "Authorization: Bearer $TOKEN"

echo "\n\n3. Check all alerts"
curl -X POST "$BASE_URL/check-all" -H "Authorization: Bearer $TOKEN"
```

## Additional Resources

- Alert Entity: `be/src/entities/Alert.ts`
- Alert Service: `be/src/services/alertService.ts`
- Alert Monitor Service: `be/src/services/alertMonitorService.ts`
- WebSocket Service: `be/src/services/websocketService.ts`
- Alert Controller: `be/src/controllers/alertController.ts`
- Alert Routes: `be/src/routes/alertRoutes.ts`
