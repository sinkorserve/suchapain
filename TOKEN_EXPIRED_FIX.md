# Fixing Token Expired Error

You're getting this error:
```
Get a fresh ID token from your client app and try again (auth/id-token-expired)
```

This happens because **Firebase tokens expire after 1 hour**. You need to sign in again.

---

## Quick Fix (30 seconds)

### Option 1: Clear localStorage and Sign In Again

**In your browser:**

1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. Type this and press Enter:
   ```javascript
   localStorage.clear()
   ```
4. **Refresh the page** (F5)
5. You'll be redirected to the sign-in page
6. **Sign in again**

### Option 2: Just Go to Sign-In Page

Simply visit: `http://localhost:3000/auth.html` and sign in again.

---

## Why This Happens

Firebase ID tokens expire after **1 hour** for security. After that, you need to either:
- Sign in again (current solution)
- Implement automatic token refresh (better solution - see below)

---

## Better Solution: Auto Token Refresh

I'll create an updated version of the auth system that automatically refreshes tokens so you don't get logged out.

**How it will work:**
1. When you sign in, Firebase provides a refresh token
2. Before the token expires (every 50 minutes), we automatically get a new token
3. You stay signed in indefinitely (until you sign out)

Would you like me to implement this? It will require updates to:
- `public/auth.html` - to store refresh token
- `public/index.html` - to auto-refresh tokens
- Both files will handle token refresh automatically

---

## For Now

Just clear localStorage and sign in again:

```javascript
// In browser console (F12)
localStorage.clear()
```

Then refresh the page and sign in again. Your token will be valid for another hour.

---

## Testing Your App

After signing in again:

1. Fill out the form on `http://localhost:3000`
2. Click **Create Report**
3. You should see success (if all APIs are working)

**If you still get errors**, please share the **exact error message** and I'll help debug it.

---

## Common Issues After Re-signing In

### Error: "REQUEST_DENIED" (Geocoding)
- This is the GCP organization billing issue
- Follow GCP_PROJECT_SETUP.md to create a personal project

### Error: "Firebase config error"
- Update `public/auth.html` with real Firebase config
- Follow RECAPTCHA_FIX.md

### Error: "Identity Toolkit blocked"
- Enable Identity Toolkit API in Google Cloud Console
- Follow RECAPTCHA_FIX.md

---

Let me know if you want me to implement automatic token refresh!
