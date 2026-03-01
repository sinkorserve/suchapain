# Firebase Configuration

This directory should contain your Firebase service account credentials.

## Setup Instructions

### Step 1: Get Your Service Account Key from Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the **⚙️ Settings** icon → **Project Settings**
4. Go to the **Service Accounts** tab
5. Click **Generate new private key**
6. A JSON file will be downloaded (e.g., `your-project-firebase-adminsdk-xxxxx.json`)

### Step 2: Add the File to This Directory

**Save the downloaded JSON file as:**
```
config/firebase-service-account.json
```

The file should look like this:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### Step 3: Update Your .env File

In your `.env` file, set:
```env
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
FIREBASE_PROJECT_ID=your-project-id
```

## Important Security Notes

⚠️ **NEVER COMMIT THIS FILE TO GIT!**

The `firebase-service-account.json` file contains sensitive credentials that give full access to your Firebase project.

✅ This file is already protected:
- Listed in `.gitignore`
- Will NOT be committed to Git
- Will NOT be pushed to GitHub

❌ Do NOT:
- Share this file publicly
- Commit it to version control
- Include it in Docker images (unless using secrets)
- Hardcode the credentials in your code

✅ DO:
- Keep it local only
- Use environment variables in production
- Rotate keys if compromised
- Use different service accounts for dev/prod

## Alternative: Environment Variables

Instead of using a JSON file, you can also provide credentials via environment variables in your `.env` file:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

The server will automatically detect and use whichever method you configure.

## Verification

After adding the file, verify it's ignored by Git:

```bash
git status
# Should NOT show config/firebase-service-account.json
```

If you see the file in `git status`, it means it's NOT being ignored. **DO NOT COMMIT IT!**

## Troubleshooting

### "Firebase credentials not found"
- Ensure the file is named exactly `firebase-service-account.json`
- Check that it's in the `config/` directory
- Verify the path in `.env` is correct

### "Permission denied" errors
- Ensure your service account has the correct roles:
  - Firebase Admin SDK Administrator Service Agent
  - Cloud Datastore User

### File shows up in `git status`
- Double-check `.gitignore` includes the file
- Run: `git rm --cached config/firebase-service-account.json`
- Never commit credentials!
