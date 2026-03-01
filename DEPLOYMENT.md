# Product CRM Manager - Standalone Deployment Guide

This guide will help you run the Product CRM Manager as a **standalone application** outside of CREAO, using Firebase and Google Maps APIs directly.

## Overview

You've already:
- ✅ Created a Firebase database
- ✅ Added Firestore rules
- ✅ Pushed your code to GitHub

Now we'll connect Firebase and Google Maps to run the app independently.

---

## Prerequisites

- Node.js 18+ installed
- Firebase project created
- Google Cloud project with Geocoding API enabled
- Git repository cloned locally

---

## Step 1: Clone Your Repository (On Your Local Machine)

```bash
git clone https://github.com/sinkorserve/suchapain.git
cd suchapain
```

---

## Step 2: Install Dependencies

```bash
npm install
```

This will install:
- `firebase-admin` - Firebase SDK for server-side
- `express` - Web framework
- `axios` - HTTP client for Google Maps API
- `dotenv` - Environment variable management
- `cors` - Cross-origin resource sharing

---

## Step 3: Get Firebase Credentials

### Option A: Service Account Key (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click ⚙️ (Project Settings) → "Service Accounts" tab
4. Click **"Generate new private key"**
5. Download the JSON file
6. Save it as `config/firebase-service-account.json` in your project

### Option B: Environment Variables

If you prefer not to use a file, you can extract the credentials from the JSON and add them to your `.env` file (see Step 5).

---

## Step 4: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Enable the **Geocoding API**:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Geocoding API"
   - Click "Enable"
4. Create API credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key
5. (Recommended) Restrict the key:
   - Click on the key you created
   - Under "API restrictions", select "Restrict key"
   - Choose "Geocoding API"
   - Click "Save"

**Note:** Google Maps API requires a billing account, even for free tier usage.

---

## Step 5: Create Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

### If using Service Account JSON file:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Application Settings
NODE_ENV=development
PORT=3000
DEFAULT_USER_ID=test-user-123
```

### If using environment variables directly:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Application Settings
NODE_ENV=development
PORT=3000
DEFAULT_USER_ID=test-user-123
```

**⚠️ Security Note:** Never commit the `.env` file or service account JSON to Git! They're already in `.gitignore`.

---

## Step 6: Create Config Directory

If using a service account JSON file:

```bash
mkdir -p config
# Move your firebase-service-account.json to config/
```

---

## Step 7: Verify Firestore Setup

Make sure your Firebase project has:

1. **Firestore Database enabled**
2. **Collection name**: `product_events` (will be created automatically)
3. **Security Rules** (already done):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /product_events/{reportId} {
      // Allow authenticated users to read their own reports
      allow read: if request.auth != null &&
                     resource.data.createdBy == request.auth.uid;

      // Allow authenticated users to create reports
      allow create: if request.auth != null &&
                       request.resource.data.createdBy == request.auth.uid;

      // Allow authenticated users to update their own reports
      allow update: if request.auth != null &&
                       resource.data.createdBy == request.auth.uid;

      // Public read for public data
      allow read: if request.auth != null;
    }
  }
}
```

**Note:** For testing without authentication, you can temporarily use:
```javascript
allow read, write: if true;  // ⚠️ ONLY for development!
```

---

## Step 8: Run the Application

### Development Mode (with auto-reload):

```bash
npm run dev
```

### Production Mode:

```bash
npm start
```

You should see:

```
✓ Firebase initialized successfully
✓ Google Maps initialized successfully
✓ Product Event Controller initialized

============================================================
🚀 Product CRM Manager API Server
============================================================
Server running on: http://localhost:3000
Environment: development

Available endpoints:
  GET    /health                    - Health check
  POST   /api/reports               - Create a report
  GET    /api/reports               - Query reports
  GET    /api/reports/:id           - Get specific report
  PATCH  /api/reports/:id           - Update a report
  DELETE /api/reports/:id           - Delete a report
  GET    /api/analytics             - Get analytics
  POST   /api/geocode               - Test geocoding
============================================================
```

---

## Step 9: Test the API

### Test 1: Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Product CRM Manager API is running",
  "timestamp": "2026-03-01T12:00:00.000Z"
}
```

### Test 2: Test Geocoding

```bash
curl -X POST http://localhost:3000/api/geocode \
  -H "Content-Type: application/json" \
  -d '{"address": "123 Main Street, San Francisco, CA 94102"}'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "lat": 37.7749,
    "lng": -122.4194,
    "zipCode": "94102",
    "nearestIntersection": "Main St & 1st Ave"
  }
}
```

### Test 3: Create a Product Report

```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Appliance",
    "make": "Samsung",
    "model": "RF28R7351SR",
    "modelNumber": "RF28R7351SR/AA",
    "issue": "Refrigerator stopped cooling",
    "address": "123 Main Street, San Francisco, CA 94102",
    "userId": "test-user-123",
    "shareFullAddress": false,
    "shareModelNumber": false
  }'
```

Expected response:
```json
{
  "success": true,
  "reportId": "abc123xyz",
  "message": "Product report created successfully",
  "data": {
    "reportId": "abc123xyz",
    "category": "Appliance",
    "make": "Samsung",
    "zipCode": "94102"
  }
}
```

### Test 4: Query Reports

```bash
curl "http://localhost:3000/api/reports?zipCode=94102"
```

### Test 5: Get Analytics

```bash
curl http://localhost:3000/api/analytics
```

---

## Step 10: Frontend Testing (Optional)

You can use tools like:
- **Postman** - Download from https://www.postman.com
- **Insomnia** - Download from https://insomnia.rest
- **Thunder Client** - VS Code extension
- **curl** - Command line (shown above)

Or create a simple HTML frontend to interact with the API.

---

## Production Deployment Options

Once your app is working locally, you can deploy it to:

### Option 1: Heroku

```bash
# Install Heroku CLI
# Add Procfile
echo "web: node src/server.js" > Procfile

# Deploy
heroku create your-app-name
heroku config:set FIREBASE_PROJECT_ID=your-project-id
heroku config:set GOOGLE_MAPS_API_KEY=your-api-key
# ... set other env vars
git push heroku main
```

### Option 2: Google Cloud Run

```bash
# Create Dockerfile
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT_ID/product-crm
gcloud run deploy --image gcr.io/PROJECT_ID/product-crm --platform managed
```

### Option 3: AWS EC2 or Elastic Beanstalk

Follow AWS deployment guides for Node.js applications.

### Option 4: Vercel / Netlify

These work for serverless deployments with some modifications.

---

## Troubleshooting

### Firebase Connection Issues

**Error:** `Failed to initialize Firebase`

**Solutions:**
- Check that `FIREBASE_PROJECT_ID` matches your Firebase project
- Verify the service account JSON path is correct
- Ensure the service account has "Firebase Admin SDK Administrator" role

### Google Maps API Issues

**Error:** `Failed to initialize Google Maps`

**Solutions:**
- Verify `GOOGLE_MAPS_API_KEY` is set in `.env`
- Check that Geocoding API is enabled in Google Cloud Console
- Ensure billing is enabled (required even for free tier)
- Verify API key restrictions aren't blocking requests

### Geocoding Returns Empty Results

**Solutions:**
- Check the address format
- Ensure the address is valid and exists
- Verify API key quotas haven't been exceeded

### "Module not found" Errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use

**Solution:**
Change the `PORT` in your `.env` file:
```env
PORT=3001  # Or any other available port
```

---

## Project Structure

```
suchapain/
├── src/
│   ├── controllers/          # Business logic
│   ├── models/               # Data models
│   ├── services/             # Firebase, Geocoding services
│   ├── utils/                # Export, analytics utilities
│   └── server.js             # Express server (NEW!)
├── config/
│   └── firebase-service-account.json  # Firebase credentials
├── tests/                    # Unit tests
├── examples/                 # Sample data
├── .env                      # Environment variables (DO NOT COMMIT)
├── .env.example              # Environment template
├── .gitignore                # Git ignore file
├── package.json              # Dependencies
└── DEPLOYMENT.md             # This file
```

---

## Security Best Practices

1. **Never commit credentials**
   - `.env` file is in `.gitignore`
   - Service account JSON is in `.gitignore`

2. **Use environment variables**
   - In production, use your hosting provider's secret management

3. **Restrict API keys**
   - Limit Google Maps API key to Geocoding API only
   - Use HTTP referrer restrictions if applicable

4. **Firestore security rules**
   - Don't use `allow read, write: if true` in production
   - Implement proper authentication

5. **Rate limiting**
   - Consider adding rate limiting middleware for production

---

## Next Steps

1. ✅ Get your app running locally
2. Test all API endpoints
3. Build a frontend (web or mobile app)
4. Deploy to a cloud platform
5. Set up monitoring and logging
6. Implement user authentication
7. Add more features!

---

## Need Help?

- Review the [TESTING.md](TESTING.md) guide for testing strategies
- Check the [README.md](README.md) for feature documentation
- See [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) for usage patterns
- Review Firebase and Google Maps API documentation

---

## Summary

You now have a fully functional standalone Product CRM Manager API that:

✅ Runs independently of CREAO
✅ Uses Firebase Firestore for data storage
✅ Uses Google Maps for geocoding
✅ Provides RESTful API endpoints
✅ Can be deployed to any Node.js hosting platform

The app is ready for frontend development or API integration!
