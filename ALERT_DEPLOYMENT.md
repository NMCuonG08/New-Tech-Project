# Alert System Deployment Guide

## Overview
This guide covers deploying the complete weather alert notification system to production (Vercel + Backend Server).

## Features to Deploy
1. ✅ Real-time WebSocket connections for instant alerts
2. ✅ Browser notification system (native OS notifications)
3. ✅ Alert creation and management UI
4. ✅ Background monitoring service (checks every 5 minutes)
5. ✅ Alert history tracking
6. ✅ Test notification buttons

## Frontend Deployment (Vercel)

### 1. Environment Variables
Go to your Vercel project settings and add these environment variables:

```bash
VITE_API_BASE_URL=http://98.87.6.224:3000/api
VITE_BACKEND_URL=http://98.87.6.224:3000
```

**Important:** 
- `VITE_API_BASE_URL` is for REST API calls
- `VITE_BACKEND_URL` is for WebSocket connections

### 2. Deploy to Vercel

Option A: Via Git (Recommended)
```bash
cd fe
git add .
git commit -m "Add alert notification system with browser notifications"
git push origin main
```

Vercel will automatically deploy when you push to the main branch.

Option B: Via Vercel CLI
```bash
cd fe
vercel --prod
```

### 3. Verify Deployment
After deployment, visit: `https://new-tech-project.vercel.app/alerts`

## Backend Configuration

### 1. Ensure Backend is Running
The backend server at `http://98.87.6.224:3000` must be running with:

- ✅ Socket.IO server initialized
- ✅ CORS enabled for `https://new-tech-project.vercel.app`
- ✅ Alert monitoring service active

### 2. Backend Environment Variables
Ensure these are set on your backend server:

```bash
FRONTEND_URL=https://new-tech-project.vercel.app
PORT=3000
NODE_ENV=production
```

### 3. Backend CORS Configuration
The backend `index.ts` should have CORS configured for production:

```typescript
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", 
  credentials: true,
}));
```

### 4. Restart Backend Server
After updating environment variables, restart the backend:

```bash
cd be
npm run dev  # or your production start command
```

## Testing in Production

### 1. User Authentication
Users MUST be logged in to use the alert system. The WebSocket connection only initializes for authenticated users.

### 2. Test Sequence
1. Visit `https://new-tech-project.vercel.app/login`
2. Log in with your credentials
3. Navigate to `/alerts`
4. Click **"Enable Browser Notifications"** - allow when prompted
5. Click **"Test Browser Notification"** - should see native OS notification
6. Click **"WebSocket Test"** - tests server communication
7. Create an alert rule and verify it saves

### 3. What to Check

#### Browser Console Logs
Look for these messages:
```
✅ WebSocket connected [socket-id]
📡 Joined room: [user-id]
🔔 REQUESTING BROWSER NOTIFICATION PERMISSION
✅ Permission GRANTED
✅ Test browser notification created
```

#### Connection Status
On the Alerts page, verify:
- "Real-time Alerts: Connected" (green indicator)
- "Browser Notifications: ✓ Enabled" (if permission granted)

#### Native Notifications
Test notifications should appear in:
- **Windows:** Notification center (bottom-right corner)
- **Mac:** Notification center (top-right corner)
- **Linux:** System notification area

## Troubleshooting

### WebSocket Connection Failed
**Issue:** "Real-time Alerts: Disconnected"

**Solutions:**
1. Check backend server is running: `http://98.87.6.224:3000`
2. Verify CORS settings in backend allow Vercel domain
3. Check browser console for detailed error messages
4. Ensure user is logged in

### Browser Notifications Not Showing
**Issue:** Test button doesn't show notifications

**Solutions:**
1. Check browser permission: Should be "granted"
2. Try clicking "Enable Browser Notifications" again
3. Check browser settings: `chrome://settings/content/notifications`
4. Ensure notifications aren't blocked for the site
5. Check browser console for errors

### Alert Rules Not Saving
**Issue:** Create Alert button doesn't work

**Solutions:**
1. Verify API endpoint is accessible: `http://98.87.6.224:3000/api/alerts`
2. Check browser network tab for failed requests
3. Verify user is authenticated
4. Check backend logs for errors

### WebSocket Test Button Disabled
**Issue:** Button is grayed out

**Cause:** WebSocket not connected

**Solutions:**
1. User must be logged in
2. Check backend server status
3. Verify environment variables are correct
4. Check browser console for connection errors

## Features Overview

### For End Users
- **Create Alert Rules:** Set thresholds for temperature, rain, wind, etc.
- **Real-time Notifications:** Instant browser notifications when conditions are met
- **Alert History:** View past alerts with timestamps
- **Test Notifications:** Verify system is working before relying on it

### For Developers
- **Test Buttons:** Verify notification permissions and WebSocket connectivity
- **Detailed Logging:** Console logs show exact flow of events
- **Status Indicators:** Visual feedback on connection and permission state

## Monitoring

### Check Alert System Health
1. Backend logs should show: "Alert monitoring started. Checking every 300 seconds"
2. Frontend should show: "Real-time Alerts: Connected"
3. Test notification should work

### Background Service
The alert monitoring service runs every 5 minutes:
- Fetches all active alert rules
- Gets current weather data for each location
- Evaluates conditions
- Sends notifications via WebSocket for triggered alerts
- Enforces 30-minute cooldown between repeat alerts

## Security Notes

1. **CORS:** Backend restricts connections to authorized domains
2. **Authentication:** Alert system requires valid user session
3. **WebSocket Rooms:** Users only receive their own alerts
4. **HTTPS:** Production should use HTTPS (Vercel provides this)

## Next Steps

1. ✅ Deploy frontend to Vercel
2. ✅ Update environment variables
3. ✅ Test in production
4. ⏳ Monitor for issues
5. ⏳ Gather user feedback
6. ⏳ Consider adding email notifications as backup

## Support

If issues persist:
1. Check browser console logs
2. Check backend server logs
3. Verify all environment variables are set correctly
4. Test with a simple alert rule first
5. Contact development team with detailed error messages
