# Authentication Setup Guide

The Product CRM Manager now requires **mandatory user authentication** to prevent false reports and ensure data integrity.

## Why Authentication is Required

✅ **Prevents spam and false reports**
✅ **Links reports to verified users**
✅ **Enables accountability**
✅ **Protects data integrity**
✅ **Allows permission management**

Without authentication, anyone could post false reports. Now, users must verify their identity via phone number or email.

---

## Setup Firebase Authentication

### Step 1: Enable Authentication in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click **Authentication** in the left menu
4. Click **Get Started**
5. Enable sign-in methods:

#### Enable Phone Authentication:
- Click **Sign-in method** tab
- Click **Phone**
- Toggle **Enable**
- Click **Save**

#### Enable Email/Password (optional):
- Click **Email/Password**
- Toggle **Enable**
- Click **Save**

### Step 2: Get Firebase Web Config

1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps**
3. If you don't have a web app, click **Add app** → Web icon
4. Copy the `firebaseConfig` object

It should look like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 3: Update auth.html with Your Config

1. Open `public/auth.html`
2. Find this section (around line 226):

```javascript
// TODO: Replace with your Firebase config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

3. Replace with your actual Firebase config from Step 2

### Step 4: Add Authorized Domain (for Phone Auth)

1. In Firebase Console, go to **Authentication** → **Settings**
2. Scroll to **Authorized domains**
3. Add your domain:
   - For local development: `localhost`
   - For production: `yourdomain.com`

---

## How It Works

### User Flow:

1. **User visits the site** → Redirected to `/auth.html` if not signed in
2. **User chooses sign-in method:**
   - **Phone:** Enters phone number → Receives SMS code → Verifies code
   - **Email:** Signs in with email/password OR creates account
3. **Authentication successful** → JWT token stored in browser
4. **User can now create reports** → Token sent with each API request
5. **Server verifies token** → Extracts user ID → Links report to user

### Token-Based Authentication:

```
Client                  Server                  Firebase
  |                       |                        |
  |-- POST /api/reports ->|                        |
  |   (with Auth token)   |                        |
  |                       |-- Verify token ------->|
  |                       |<-- User ID confirmed --|
  |                       |                        |
  |                       |-- Create report        |
  |                       |   (with verified UID)  |
  |<-- Success response --|                        |
```

---

## Testing Authentication

### Test Phone Authentication:

1. Start your server: `npm start`
2. Go to `http://localhost:3000/auth.html`
3. Enter a phone number (must be real for SMS)
4. Receive and enter verification code
5. You'll be redirected to the main page

**Note:** Phone auth requires real phone numbers in production. For testing, you can add test phone numbers in Firebase Console → Authentication → Settings → Phone numbers for testing.

### Test Email Authentication:

1. Go to `http://localhost:3000/auth.html`
2. Click **Email** tab
3. Create account with email/password
4. Sign in

### Test Protected Endpoints:

Without authentication:
```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -d '{"category":"Appliance","make":"Samsung","model":"RF28","issue":"broken","address":"123 Main St"}'

# Response: 401 Unauthorized
```

With authentication:
```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"category":"Appliance","make":"Samsung","model":"RF28","issue":"broken","address":"123 Main St"}'

# Response: 201 Created (with report ID)
```

---

## Security Features

### JWT Token Verification:
- Every API request validates the Firebase ID token
- Expired tokens are rejected (user must sign in again)
- Invalid tokens return 401 Unauthorized

### User ID Binding:
- Reports are automatically linked to the authenticated user's UID
- Users cannot specify a different `userId` (ignored in request)
- Each report shows who created it

### Token Expiration:
- Firebase tokens expire after 1 hour
- Users are prompted to sign in again
- Automatic refresh can be implemented

---

## Frontend Updates Needed

Your `index.html` form needs to be updated to:

1. **Check if user is authenticated** on page load
2. **Redirect to `/auth.html`** if no token
3. **Send token with API requests**
4. **Handle 401 errors** (redirect to sign in)
5. **Show user info** (phone/email)
6. **Add sign out button**

I can create an updated `index.html` with these features if you'd like!

---

## Production Considerations

### Phone Authentication Costs:
- Firebase Phone Auth has usage limits
- After free tier: ~$0.06 per verification
- Set up billing in Google Cloud Console

### Email Verification:
- Consider requiring email verification
- Prevents fake email signups
- Enable in Firebase Console → Authentication → Settings

### Rate Limiting:
- Add rate limiting to prevent abuse
- Limit sign-ups per IP
- Limit verification attempts

### Security Rules:
- Your Firestore rules should check `request.auth.uid`
- Only allow users to read/write their own reports
- See SETUP_GUIDE.md for security rules

---

## Troubleshooting

### "reCAPTCHA not loading"
- Check that your domain is authorized
- Verify Firebase config is correct
- Check browser console for errors

### "SMS not received"
- Verify phone number format includes country code (+1, +44, etc.)
- Check Firebase quota limits
- Try test phone numbers for development

### "Token verification failed"
- Ensure Firebase Admin SDK is initialized in server.js
- Check that the same Firebase project is used on client and server
- Verify token hasn't expired

---

## Next Steps

1. ✅ Enable authentication in Firebase Console
2. ✅ Update `auth.html` with your Firebase config
3. ✅ Test phone and email authentication
4. ✅ Update `index.html` to check auth and send tokens
5. ✅ Deploy and test in production

**Your app is now secure!** Only authenticated users can create reports, ensuring data integrity and preventing spam.
