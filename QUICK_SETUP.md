# Quick Setup Guide

## You Asked: Can I Push My Updated Credentials to GitHub?

**Answer: NO - but I've fixed it so you can push safely now!**

---

## What I Changed (Just Now)

I updated your app so **all credentials stay in `.env`** (never pushed to GitHub):

### New Files:
- `src/routes/config.js` - Server endpoint that provides Firebase config
- `CREDENTIALS_SECURITY.md` - Detailed security explanation

### Updated Files:
- `public/auth.html` - Now fetches Firebase config from server instead of hardcoding
- `src/server.js` - Added config route

---

## What You Need to Do

### 1. Update Your Local .env File

Open your `.env` file and make sure it has ALL these values:

```env
# From Firebase Console > Project Settings > Web App
FIREBASE_API_KEY=AIzaSyB...
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123

# Path to service account JSON
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json

# From Google Cloud Console > APIs & Services > Credentials
GOOGLE_MAPS_API_KEY=AIzaSyC...

# App settings
NODE_ENV=development
PORT=3000
```

### 2. Pull My Changes from This Session

I've updated the files in this workspace. You need to:

**Option A: Copy the updated files manually**
- Copy `src/routes/config.js` (new file)
- Copy `public/auth.html` (updated)
- Copy `src/server.js` (updated)
- Copy all the new `.md` guide files

**Option B: I can create a patch file you can apply**

Let me know which you prefer.

### 3. Test Locally

```bash
npm start
```

You should see:
```
✓ Firebase initialized successfully
✓ Google Maps initialized successfully
✓ Product Event Controller initialized
Server running on http://localhost:3000
```

### 4. Test in Browser

```bash
# Open browser to:
http://localhost:3000/auth.html
```

Check the browser console (F12) - you should see:
```
✓ Firebase initialized successfully
```

### 5. Push to GitHub (Now Safe!)

```bash
git add .
git commit -m "Load Firebase config from server environment"
git push origin main
```

---

## Your Identity Toolkit Error

The error you're getting:
```
auth/requests-to-this-api-identitytoolkit-method-google.cloud.identitytoolkit.v1.authenticationservice.getrecaptchaparam-are-blocked
```

**Root cause:** Your GCP project is inside an organization, which is blocking the Identity Toolkit API.

**Solutions (in order of preference):**

1. **Create new personal GCP project** (RECOMMENDED)
   - See `GCP_PROJECT_SETUP.md`
   - Takes 15-20 minutes
   - Permanent fix for all API issues

2. **Try email authentication instead of phone**
   - Doesn't require reCAPTCHA
   - Might work even with organization restrictions
   - Test this first to see if your app works

3. **Ask organization admin to enable billing/APIs**
   - See `GCP_PROJECT_SETUP.md` Solution 3
   - Depends on admin availability

---

## Current Status Summary

### ✅ What's Working:
- Express server setup
- Authentication middleware
- Form validation
- Privacy controls
- Credentials now secured in .env

### ⚠️ What Needs Fixing:

1. **Identity Toolkit API blocked** (GCP organization issue)
   - Try email auth first (doesn't need reCAPTCHA)
   - If still blocked, create personal GCP project

2. **Geocoding API likely blocked** (same GCP issue)
   - Will be fixed when you create personal project

---

## Next Steps

1. Update your local `.env` with all Firebase config values
2. Copy my updated files to your local machine
3. Test with `npm start`
4. Try **email authentication** first (simpler than phone)
5. If email works, test creating a report
6. If geocoding fails, create personal GCP project

---

## Files You Can Now Push to GitHub

After copying my changes:

✅ `public/auth.html` - Fetches config from server
✅ `public/index.html` - No credentials
✅ `src/**/*.js` - All server code
✅ `package.json` - Dependencies
✅ `.env.example` - Template only
✅ `.gitignore` - Protects credentials
✅ All `.md` documentation files

❌ `.env` - Protected by .gitignore
❌ `config/firebase-service-account.json` - Protected by .gitignore

---

Need help copying the updated files?
