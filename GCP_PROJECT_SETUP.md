# Moving Your GCP Project Out of Organization

You're experiencing a billing issue because your project is inside a GCP organization. The easiest solution is to create a new personal GCP project outside the organization.

---

## Solution 1: Create New Personal Project (RECOMMENDED)

This is the fastest and cleanest solution to resolve your billing issue.

### Step 1: Create New GCP Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click the project dropdown at the top
3. Click **NEW PROJECT**
4. **IMPORTANT:** In the "Organization" dropdown, select **No organization**
   - This creates a personal project not tied to any org
5. Enter project name: `product-crm-personal` (or your choice)
6. Click **CREATE**

### Step 2: Enable Billing

1. Go to [Billing](https://console.cloud.google.com/billing)
2. Click **LINK A BILLING ACCOUNT**
3. Create a new billing account or select existing personal billing account
4. Link your credit/debit card
5. Confirm billing is enabled for your project

### Step 3: Enable Required APIs

1. Go to [APIs & Services > Library](https://console.cloud.google.com/apis/library)
2. Search for **"Geocoding API"**
3. Click **ENABLE**
4. Search for **"Firestore API"**
5. Click **ENABLE**
6. Search for **"Firebase Authentication API"**
7. Click **ENABLE**

### Step 4: Create API Key

1. Go to [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **+ CREATE CREDENTIALS** → **API Key**
3. Copy the API key (you'll use this in .env)
4. Click **Edit API Key** (pencil icon)
5. **Application restrictions:** None
6. **API restrictions:**
   - Select **Restrict key**
   - Check: Geocoding API, Firestore API
7. Click **SAVE**

### Step 5: Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Add Project**
3. Select your newly created GCP project from dropdown
4. Follow Firebase setup wizard
5. Enable Firestore Database:
   - Go to **Build** → **Firestore Database**
   - Click **Create Database**
   - Start in **production mode**
   - Choose location closest to your users
6. Enable Authentication:
   - Go to **Build** → **Authentication**
   - Click **Get Started**
   - Enable **Phone** and **Email/Password**

### Step 6: Download Service Account Key

1. In Firebase Console, click **Project Settings** (gear icon)
2. Go to **Service Accounts** tab
3. Click **Generate New Private Key**
4. Save the JSON file as `firebase-service-account.json`
5. Move it to your project's `config/` folder

### Step 7: Get Firebase Web Config

1. In Firebase Console, go to **Project Settings**
2. Scroll to **Your apps** section
3. Click the **</>** (Web) icon to add a web app
4. Register app (name: "Product CRM Web")
5. Copy the `firebaseConfig` object
6. Update `public/auth.html` with this config (around line 272)

### Step 8: Update Your .env File

Update your `.env` file with the new credentials:

```env
FIREBASE_PROJECT_ID=your-new-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
GOOGLE_MAPS_API_KEY=your_new_api_key_here
NODE_ENV=development
PORT=3000
```

### Step 9: Test Geocoding

Run the diagnostic script to verify everything works:

```bash
node test-geocoding.js
```

You should see:
```
✅ SUCCESS! Geocoding is working correctly
```

### Step 10: Test Your App

```bash
npm start
```

Visit `http://localhost:3000` and create a test report. The geocoding should now work!

---

## Solution 2: Move Existing Project (More Complex)

**Warning:** This is more complicated and may not be possible depending on organization policies.

### Check If Migration Is Possible

1. You need to be an **Organization Admin** to move projects
2. If you're not an admin, you'll need to request this from your org admin

### Steps to Move Project (If You're Org Admin)

1. Go to [Resource Manager](https://console.cloud.google.com/cloud-resource-manager)
2. Find your project
3. Click the **⋮** (three dots) menu
4. Select **Move**
5. Select **No organization** as destination
6. Confirm the move

**Note:** Some resources might not migrate properly. Creating a new project is safer.

---

## Solution 3: Ask Organization Admin for Help

If you must keep the project in the org:

1. Contact your organization's GCP admin
2. Request them to:
   - Enable billing for your specific project
   - Grant you **Billing Account User** role
   - Ensure project has access to billing account

3. They can do this at:
   - [IAM & Admin > Manage Resources](https://console.cloud.google.com/iam-admin/cloudresourcemanager)
   - Select your project → **Change Billing**

---

## Why This Happens

**Organization Projects:**
- Billing is managed at organization level
- Individual users often can't enable billing
- Requires organization admin permissions

**Personal Projects:**
- Full control over billing
- Can link your own card directly
- No organization restrictions

---

## Recommended Path

**For your situation, I recommend Solution 1 (Create New Personal Project):**

✅ Fastest solution (15 minutes)
✅ No organization dependencies
✅ Full control over billing
✅ Clean start with proper configuration
✅ Can delete old project later once migrated

---

## After Setup Checklist

Once you've created your new personal project:

- [ ] Billing enabled and working
- [ ] Geocoding API enabled
- [ ] Firestore API enabled
- [ ] Firebase Authentication enabled
- [ ] API key created with correct restrictions
- [ ] Service account key downloaded
- [ ] Firebase web config copied to auth.html
- [ ] .env file updated with new credentials
- [ ] test-geocoding.js runs successfully
- [ ] App starts without errors
- [ ] Can create reports with geocoding working

---

## Need Help?

If you encounter any errors during setup:

1. Run `node test-geocoding.js` to diagnose geocoding issues
2. Check Firebase Console → Authentication for auth issues
3. Check browser console (F12) for frontend errors
4. Check server logs for backend errors

**Common errors after migration:**
- "API key not valid" → Update .env with new API key
- "Firebase auth error" → Update auth.html with new Firebase config
- "Permission denied" → Check Firestore security rules

---

You should be able to complete this setup in about 15-20 minutes, and your geocoding will work immediately!
