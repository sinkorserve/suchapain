# SuchaPain - Production Deployment Guide

This guide covers deploying SuchaPain Product Quality Tracker to production with a custom domain.

## Table of Contents
1. [Platform Options](#platform-options)
2. [Railway Deployment (Recommended)](#railway-deployment-recommended)
3. [Render Deployment](#render-deployment)
4. [Google Cloud Run](#google-cloud-run)
5. [Custom Domain Setup](#custom-domain-setup)
6. [Environment Variables](#environment-variables)
7. [Post-Deployment Steps](#post-deployment-steps)

---

## Platform Options

We recommend **Railway** for its simplicity and generous free tier, but you can also use:
- **Render** - Free tier available, automatic SSL
- **Google Cloud Run** - Pay-per-use, integrates well with Firebase
- **Heroku** - Easy deployment, no free tier anymore
- **DigitalOcean App Platform** - $5/month minimum

---

## Railway Deployment (Recommended)

### Step 1: Create Railway Account
1. Go to https://railway.app/
2. Sign up with GitHub
3. Verify your email

### Step 2: Deploy from GitHub
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `suchapain` repository
4. Railway will auto-detect Node.js and deploy

### Step 3: Configure Environment Variables
1. Click on your deployment
2. Go to "Variables" tab
3. Add the following variables:

```bash
NODE_ENV=production
PORT=3000

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:abc123

# Firebase Service Account (copy entire JSON as single line)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project",...}

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Step 4: Generate Domain
1. Go to "Settings" tab
2. Click "Generate Domain"
3. Railway will give you a free domain like: `suchapain-production.up.railway.app`

### Step 5: Add Custom Domain (Optional)
1. Buy a domain from Namecheap, Google Domains, or Cloudflare
2. In Railway "Settings" → "Custom Domain"
3. Add your domain (e.g., `www.suchapain.com`)
4. Railway will provide DNS records:
   - **CNAME**: `www` → `suchapain-production.up.railway.app`
   - **A Record**: `@` → Railway's IP address
5. Add these DNS records in your domain registrar
6. Wait 5-30 minutes for DNS propagation
7. Railway automatically provides SSL certificate

---

## Render Deployment

### Step 1: Create Render Account
1. Go to https://render.com/
2. Sign up with GitHub

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: suchapain
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Plan**: Free

### Step 3: Add Environment Variables
Go to "Environment" tab and add all variables from the Railway section above.

### Step 4: Deploy
Click "Create Web Service" - Render will build and deploy automatically.

### Step 5: Custom Domain
1. Go to "Settings" → "Custom Domain"
2. Add your domain
3. Update DNS records at your registrar:
   - **CNAME**: `www` → `suchapain.onrender.com`
4. Render provides automatic SSL

---

## Google Cloud Run

### Step 1: Build Docker Image
```bash
# From project root
docker build -t gcr.io/YOUR_PROJECT_ID/suchapain:latest .
```

### Step 2: Push to Google Container Registry
```bash
# Authenticate
gcloud auth configure-docker

# Push image
docker push gcr.io/YOUR_PROJECT_ID/suchapain:latest
```

### Step 3: Deploy to Cloud Run
```bash
gcloud run deploy suchapain \
  --image gcr.io/YOUR_PROJECT_ID/suchapain:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,FIREBASE_PROJECT_ID=your-project-id,..."
```

### Step 4: Map Custom Domain
```bash
gcloud run services update suchapain \
  --platform managed \
  --region us-central1 \
  --set-domain www.suchapain.com
```

---

## Custom Domain Setup

### Option 1: Cloudflare (Recommended)
1. Transfer your domain to Cloudflare or update nameservers
2. In Cloudflare DNS:
   - **CNAME**: `www` → `your-app.railway.app`
   - **CNAME**: `@` → `your-app.railway.app`
3. Enable "Proxied" for free CDN and DDoS protection
4. SSL/TLS mode: "Full" or "Full (strict)"

### Option 2: Direct DNS
1. Log in to your domain registrar
2. Go to DNS settings
3. Add records:
   - **Type**: CNAME, **Host**: www, **Value**: `your-app.railway.app`
4. Wait for DNS propagation (5-30 minutes)

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `3000` |
| `FIREBASE_API_KEY` | Firebase web API key | `AIzaSyD...` |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `your-project.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `your-project-id` |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `your-project.firebasestorage.app` |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | `123456789012` |
| `FIREBASE_APP_ID` | Firebase app ID | `1:123456789012:web:abc123` |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase service account JSON | Minified JSON string |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key | `AIzaSyD...` |

### How to Get Firebase Service Account JSON

1. Go to Firebase Console
2. Project settings → Service accounts
3. Click "Generate new private key"
4. Download JSON file
5. Minify it: `cat firebase-service-account.json | jq -c`
6. Paste as `FIREBASE_SERVICE_ACCOUNT_JSON`

---

## Post-Deployment Steps

### 1. Update Firebase Authorized Domains
1. Firebase Console → Authentication → Settings
2. Add your production domains

### 2. Update Google Maps API Restrictions
1. Google Cloud Console → Credentials
2. Add HTTP referrer: `https://www.suchapain.com/*`

### 3. Test Deployment
```bash
curl https://www.suchapain.com
```

---

## Troubleshooting

- **Firebase errors**: Check `FIREBASE_SERVICE_ACCOUNT_JSON` is minified
- **CORS errors**: Verify domain in Firebase authorized domains
- **Maps not loading**: Check API key restrictions
- **DNS issues**: Wait 30 minutes, use `nslookup yourdomain.com`

---

## Security Checklist

✅ All secrets in environment variables
✅ `.env` in `.gitignore`
✅ HTTPS enabled
✅ API keys restricted to your domain
✅ NODE_ENV=production

---

## Cost Estimates

- **Railway**: $5 credit/month free
- **Render**: 750 hours/month free
- **Google Cloud Run**: 2M requests/month free

