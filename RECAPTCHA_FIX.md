# Fixing Firebase reCAPTCHA Error

You're getting this error:
```
Error: Firebase: Error (auth/requests-to-this-api-identitytoolkit-method-google.cloud.identitytoolkit.v1.authenticationservice.getrecaptchaparam-are-blocked.)
```

This means the Identity Toolkit API is blocked. Here's how to fix it:

---

## Quick Fix (5 minutes)

### Step 1: Enable Identity Toolkit API

1. Go to your Google Cloud Console
2. Navigate to: [Identity Toolkit API](https://console.cloud.google.com/marketplace/product/google/identitytoolkit.googleapis.com)
3. **Select your GCP project** from the dropdown
4. Click **ENABLE**
5. Wait 1-2 minutes for it to activate

### Step 2: Update Firebase Config in auth.html

You still have placeholder values in `public/auth.html` (line 272-279). You need to replace them with your **actual Firebase config**.

**How to get your Firebase config:**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the **gear icon** (⚙️) → **Project Settings**
4. Scroll down to **"Your apps"** section
5. If you don't have a web app yet:
   - Click **</>** (Web) icon
   - Register app with name: "Product CRM Web"
   - Copy the `firebaseConfig` object
6. If you already have a web app:
   - Click on your web app name
   - Scroll to **"SDK setup and configuration"**
   - Select **"Config"** radio button
   - Copy the `firebaseConfig` object

**Example of what it should look like:**
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyB1234567890abcdefghijklmnopqr",
    authDomain: "my-project-12345.firebaseapp.com",
    projectId: "my-project-12345",
    storageBucket: "my-project-12345.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abc123def456"
};
```

**Update auth.html:**

Open `public/auth.html` and replace lines 272-279 with your actual config.

### Step 3: Verify Your Domain (Important!)

Firebase requires authorized domains for authentication:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** → **Settings** tab
4. Scroll to **Authorized domains**
5. Make sure these domains are listed:
   - `localhost` ✓ (should be there by default)
   - If deploying: add your production domain

### Step 4: Test Again

After completing steps 1-3:

1. **Clear your browser cache** (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. Restart your server: `npm start`
3. Open `http://localhost:3000/auth.html` in an **Incognito/Private window**
4. Try phone or email authentication

---

## If You Still Get Errors

### Error: "auth/api-key-not-valid"
- You didn't update the Firebase config in auth.html
- The API key in auth.html is still "YOUR_API_KEY"

### Error: "auth/invalid-api-key"
- Wrong API key copied
- Get it again from Firebase Console

### Error: "auth/unauthorized-domain"
- Add `localhost` to authorized domains in Firebase Console

### Error: "reCAPTCHA render error"
- Clear browser cache
- Use Incognito/Private browsing mode
- Check browser console for detailed errors

### Error: Still getting Identity Toolkit blocked
- Wait 5 minutes after enabling the API (propagation time)
- Make sure you enabled it on the **correct project**
- Check you have billing enabled on the project

---

## Alternative: Use Email Authentication (Simpler)

If phone authentication continues to have issues, **email authentication is much simpler** and doesn't require reCAPTCHA:

1. Go to Firebase Console → Authentication → Sign-in method
2. Enable **Email/Password**
3. In your app, use the **Email** tab instead of **Phone** tab
4. Click **"Create Account"** first, then sign in

Email authentication will work immediately without reCAPTCHA configuration.

---

## Testing Checklist

After fixing:

- [ ] Identity Toolkit API is enabled
- [ ] Firebase config in auth.html has real values (not "YOUR_API_KEY")
- [ ] `localhost` is in authorized domains
- [ ] Browser cache cleared
- [ ] Server restarted
- [ ] Testing in Incognito/Private window

---

## Important: Which GCP Project Are You Using?

**CRITICAL:** Are you using:
- ✅ A **new personal GCP project** (outside organization)?
- ❌ The **old organization project**?

If you're still using the organization project, the Identity Toolkit API might be blocked by organization policies. You should:

1. **Create a new personal GCP project** (see GCP_PROJECT_SETUP.md)
2. **Create a new Firebase project** linked to your personal GCP project
3. Update all credentials with the new project

This will solve all API blocking issues permanently.

---

Let me know which error you're getting after following these steps!
