# OAuth2 Deployment Guide

## Problem
After OAuth2 login on Vercel, users are redirected back to localhost instead of staying on the production domain.

## Root Cause
The backend's `FRONTEND_URL` environment variable determines where OAuth callbacks redirect users. If it's set to localhost in production, users will be redirected there.

## Solution

### 1. Google Cloud Console Configuration

Add both your production callback URL to Google OAuth credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Add these Authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (for local development)
   - `https://your-backend-domain.com/api/auth/google/callback` (for production)

### 2. Backend Environment Variables

Set these environment variables on your backend deployment platform:

```env
# Production Backend Environment Variables
FRONTEND_URL=https://new-tech-project.vercel.app
BACKEND_URL=https://your-backend-domain.com
JWT_SECRET=your_secure_secret_key
SESSION_SECRET=your_secure_session_secret
GOOGLE_CLIENT_ID=18012569890-nrvu711d2o6s7joqami3qt0r63n8e4me.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
NODE_ENV=production

# Database credentials
DB_HOST=your_db_host
DB_PORT=3306
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=weather_db
```

**Important:** `FRONTEND_URL` must point to your Vercel frontend URL, not localhost!

### 3. Frontend Environment Variables (Vercel)

In your Vercel project settings, add:

```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

This ensures the frontend OAuth button redirects to the production backend.

### 4. Deployment Platforms

#### Backend (Railway/Heroku/DigitalOcean)
- Set all environment variables listed in step 2
- Deploy your backend code
- Note the backend URL (e.g., `https://your-app.railway.app`)

#### Frontend (Vercel)
- Go to your Vercel project → Settings → Environment Variables
- Add `VITE_API_BASE_URL` with your backend URL
- Redeploy the frontend

### 5. Testing

1. Visit your production frontend: `https://new-tech-project.vercel.app`
2. Click "Login with Google"
3. Should redirect to: `https://your-backend-domain.com/api/auth/google`
4. After Google authentication, should redirect back to: `https://new-tech-project.vercel.app?auth=success&data=...`
5. User should be logged in on the production site

## OAuth Flow Diagram

```
User on Vercel
    ↓ Click "Login with Google"
Frontend gets BACKEND_URL from VITE_API_BASE_URL
    ↓ Redirects to backend OAuth endpoint
Backend (https://your-backend-domain.com/api/auth/google)
    ↓ Redirects to Google
Google Authentication
    ↓ Redirects to backend callback
Backend (uses FRONTEND_URL env var)
    ↓ Redirects to frontend with auth data
Frontend (https://new-tech-project.vercel.app?auth=success&data=...)
    ↓ Saves auth data and reloads
User logged in!
```

## Common Issues

### Issue: Still redirecting to localhost
- **Cause**: Environment variables not set correctly in production
- **Fix**: Double-check environment variables in your deployment platform dashboard

### Issue: OAuth error "redirect_uri_mismatch"
- **Cause**: The callback URL is not authorized in Google Cloud Console
- **Fix**: Add the production callback URL to Google OAuth credentials

### Issue: CORS errors
- **Cause**: Backend CORS not configured for production frontend URL
- **Fix**: Update backend CORS configuration to include your Vercel domain

## Quick Checklist

- [ ] Google OAuth credentials include production callback URL
- [ ] Backend `FRONTEND_URL` set to Vercel URL
- [ ] Backend `BACKEND_URL` set to backend domain
- [ ] Frontend `VITE_API_BASE_URL` set to backend API URL
- [ ] All environment variables configured in deployment platforms
- [ ] Both frontend and backend redeployed after config changes
