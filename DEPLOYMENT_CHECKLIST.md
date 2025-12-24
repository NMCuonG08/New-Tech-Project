# Quick Deployment Checklist

## Pre-Deployment
- [x] All code changes committed
- [x] Test buttons work in development
- [x] Browser notifications working locally
- [x] WebSocket connection stable
- [x] Backend running and accessible

## Frontend (Vercel)

### 1. Set Environment Variables in Vercel Dashboard
Go to: https://vercel.com/[your-project]/settings/environment-variables

Add:
```
VITE_API_BASE_URL = http://98.87.6.224:3000/api
VITE_BACKEND_URL = http://98.87.6.224:3000
```

### 2. Deploy
```bash
cd fe
git add .
git commit -m "feat: Add browser notification system for weather alerts"
git push origin main
```

Or manually trigger deployment in Vercel dashboard.

## Backend (Server at 98.87.6.224)

### 1. Set Environment Variable
```bash
export FRONTEND_URL=https://new-tech-project.vercel.app
# or add to .env file:
echo "FRONTEND_URL=https://new-tech-project.vercel.app" >> .env
```

### 2. Restart Server
```bash
cd be
pm2 restart all
# or
npm run dev
```

## Post-Deployment Testing

### Visit: https://new-tech-project.vercel.app/alerts

1. [ ] Login works
2. [ ] Page loads without errors
3. [ ] "Real-time Alerts: Connected" shows
4. [ ] Click "Enable Browser Notifications" - browser prompts
5. [ ] After allowing - test notification appears in system tray
6. [ ] Click "Test Browser Notification" - notification appears
7. [ ] Click "WebSocket Test" - notification appears
8. [ ] Create an alert rule - saves successfully
9. [ ] Alert appears in list

## Verification Commands

### Check Backend Status
```bash
curl http://98.87.6.224:3000/
# Should return: "Hello from Express..."
```

### Check WebSocket
Open browser console at https://new-tech-project.vercel.app/alerts
Should see:
```
✅ WebSocket connected [id]
📡 Joined room: [userId]
```

## Rollback Plan
If issues occur:

1. Frontend: Revert via Vercel dashboard → Deployments → [previous deployment] → "Promote to Production"
2. Backend: `git checkout [previous-commit]` and restart server

## Done! 🎉
All new features should now be live at: https://new-tech-project.vercel.app/alerts
