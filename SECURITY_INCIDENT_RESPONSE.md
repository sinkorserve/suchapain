# URGENT: API Key Exposure - Immediate Action Required

## What Happened

Your Firebase API key was exposed in a public GitHub repository (.env.example file).
Google Cloud Compliance has flagged this as a security violation.

---

## IMMEDIATE ACTIONS (Do These NOW)

### Step 1: Revoke the Exposed Firebase API Key

1. Go to [Google Cloud Console - API Credentials](https://console.cloud.google.com/apis/credentials)
2. Select your project: **suchapain**
3. Find the API key: `AIzaSyCEtuW7hljLQZgx63PkmA8LGjO6-BB_6Z8`
4. Click on it
5. Click **DELETE** (or **REGENERATE** if available)
6. Confirm deletion

### Step 2: Create a NEW API Key

1. In the same Credentials page, click **+ CREATE CREDENTIALS**
2. Select **API Key**
3. Copy the new key immediately
4. Click **EDIT API KEY** (pencil icon)
5. **Application restrictions:**
   - Select **HTTP referrers (web sites)**
   - Add: `http://localhost:3000/*`
   - Add: `https://yourdomain.com/*` (if you have a production domain)
6. **API restrictions:**
   - Select **Restrict key**
   - Check: **Geocoding API**
7. Click **SAVE**

### Step 3: Remove Exposed Credentials from GitHub History

The exposed key is in your git history. You need to remove it:

**Option A: Using git filter-repo (Recommended)**

```bash
# Install git-filter-repo
pip install git-filter-repo

# Backup your repo first
cd suchapain
cp -r . ../suchapain-backup

# Remove the exposed credentials from history
git filter-repo --path .env.example --invert-paths --force

# Or use BFG Repo-Cleaner
# Download from: https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --replace-text passwords.txt  # Create passwords.txt with your exposed key
```

**Option B: Delete and Re-create Repository (Simpler but lose history)**

```bash
# On your local machine
cd suchapain
rm -rf .git

# Re-initialize git
git init
git add .
git commit -m "Initial commit with secure credentials handling"

# Delete old GitHub repo and create new one
# Go to: https://github.com/sinkorserve/suchapain/settings
# Scroll to "Danger Zone" → Delete this repository

# Create new repo and push
git remote add origin git@github.com:sinkorserve/suchapain.git
git push -u origin main --force
```

### Step 4: Remove Credentials from .env.example

Your `.env.example` should NEVER have real credentials. Update it:

```env
# Firebase Client Configuration (from Firebase Console > Project Settings > Web App)
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123

# Firebase Admin SDK (Server-side)
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Application Settings
NODE_ENV=development
PORT=3000
```

### Step 5: Update Your Local .env with NEW Key

```bash
# In your .env file (NOT .env.example)
FIREBASE_API_KEY=your_NEW_api_key_here
GOOGLE_MAPS_API_KEY=your_NEW_google_maps_key_here
# ... other values
```

---

## What Should Be in .env vs .env.example

### ✅ .env (LOCAL ONLY, in .gitignore)
- Real API keys
- Real credentials
- Actual project IDs
- **NEVER commit to git**

### ✅ .env.example (Safe to commit)
- Placeholder values only
- Template showing required variables
- No real credentials
- Example: `FIREBASE_API_KEY=your_api_key_here`

---

## How to Handle Credentials Correctly

### The Right Way (What We Should Have Done)

1. **Keep real credentials ONLY in .env** (never committed)
2. **.env.example has placeholders** (safe to commit)
3. **Server serves config to frontend** (already implemented)
4. **Never hardcode credentials in any committed file**

### What Files Should NEVER Have Real Credentials

❌ `.env.example` - Use placeholders only
❌ `public/auth.html` - Should fetch from server
❌ `src/**/*.js` - Use process.env instead
❌ Any file committed to git

---

## Verification Checklist

After completing steps above:

- [ ] Old API key deleted/revoked in GCP Console
- [ ] New API key created with restrictions
- [ ] .env.example updated with placeholders only
- [ ] Local .env has new real API keys
- [ ] Git history cleaned (exposed key removed)
- [ ] Pushed clean version to GitHub
- [ ] Verified no credentials in any committed files
- [ ] Server restart: `npm start`
- [ ] Test authentication works with new keys

---

## Monitor for Abuse

Check your Google Cloud billing and Firebase usage for the next few days to ensure the exposed key wasn't abused:

1. [Google Cloud Billing](https://console.cloud.google.com/billing)
2. [Firebase Usage](https://console.firebase.google.com/project/suchapain/usage)

If you see unexpected charges or usage spikes, contact Google Cloud Support immediately.

---

## Responding to Google Cloud Compliance

If you received an email from Google Cloud Compliance:

1. Reply to the email
2. Explain that you've:
   - Revoked the exposed key immediately
   - Created a new restricted key
   - Removed credentials from git history
   - Implemented proper credential management
3. Provide evidence (screenshot of deleted key)

---

## My Apologies

I made a mistake by putting real credentials in .env.example. This was wrong and created a security incident. The correct approach is:

1. .env.example = placeholders only (safe to commit)
2. .env = real values (never committed, in .gitignore)
3. Server endpoint serves config to frontend

I've now corrected this approach in the codebase.

---

## Questions?

If you need help with any of these steps, let me know. Security incidents need immediate action.
