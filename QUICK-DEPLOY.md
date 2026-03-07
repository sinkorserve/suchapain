# Quick Deployment Guide - Get Online in 10 Minutes

This is the fastest way to deploy SuchaPain to production with Railway (free tier).

## Prerequisites
- GitHub account with your code pushed
- Firebase project set up
- Google Maps API key

## Step-by-Step Deployment

### 1. Create Railway Account (2 minutes)
1. Go to https://railway.app/
2. Click "Login" → "Login with GitHub"
3. Authorize Railway to access your GitHub

### 2. Deploy Your App (3 minutes)
1. Click "New Project" button
2. Select "Deploy from GitHub repo"
3. Find and select your `suchapain` repository
4. Railway will automatically:
   - Detect it's a Node.js app
   - Install dependencies
   - Try to start the server (will fail due to missing env vars - that's OK!)

### 3. Add Environment Variables (4 minutes)
1. Click on your deployment
2. Go to "Variables" tab
3. Click "RAW Editor" for easier pasting
4. Copy-paste this template and fill in your values:

```
NODE_ENV=production
FIREBASE_API_KEY=YOUR_VALUE_HERE
FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=YOUR_VALUE_HERE
FIREBASE_APP_ID=YOUR_VALUE_HERE
GOOGLE_MAPS_API_KEY=YOUR_VALUE_HERE
```

4. For `FIREBASE_SERVICE_ACCOUNT_JSON`:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key" → Download JSON
   - Open the JSON file and copy ALL the content
   - Minify it (remove line breaks): Use https://codebeautify.org/jsonminifier
   - Add to Railway: `FIREBASE_SERVICE_ACCOUNT_JSON=<paste_minified_json>`

5. Click "Deploy" or wait for auto-deploy

### 4. Get Your URL (1 minute)
1. Go to "Settings" tab
2. Scroll to "Domains"
3. Click "Generate Domain"
4. Railway gives you a free URL like: `suchapain-production.up.railway.app`
5. Copy this URL - this is your live site! 🎉

### 5. Update Firebase & Google Maps (2 minutes)

**Firebase:**
1. Go to Firebase Console → Authentication → Settings
2. Under "Authorized domains", click "Add domain"
3. Paste your Railway URL (without https://)
4. Click "Add"

**Google Maps:**
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Click on your API key
3. Under "Application restrictions" → "HTTP referrers"
4. Click "Add an item"
5. Add: `https://YOUR-RAILWAY-URL.railway.app/*`
6. Click "Save"

### 6. Test Your Deployment ✅
1. Visit your Railway URL in a browser
2. You should see the SuchaPain homepage
3. Try signing in
4. Submit a test report

## Done! Your app is live! 🚀

---

## Optional: Add Custom Domain

### If you have a domain (e.g., www.suchapain.com):

1. **In Railway:**
   - Settings → Domains → "Custom Domain"
   - Enter your domain: `www.suchapain.com`
   - Railway will show DNS instructions

2. **In your domain registrar (Namecheap, Google Domains, etc.):**
   - Add CNAME record:
     - Type: `CNAME`
     - Host: `www`
     - Value: `YOUR-APP.up.railway.app`
   - Save

3. **Wait 5-30 minutes** for DNS to propagate

4. **Update Firebase & Google Maps** with your custom domain (repeat Step 5 above)

---

## Troubleshooting

**App won't start:**
- Check Railway logs (click "Logs" tab)
- Verify all environment variables are set

**Firebase auth not working:**
- Make sure Railway URL is in Firebase Authorized Domains
- Check browser console for errors

**Map not loading:**
- Verify Google Maps API key is correct
- Check API key restrictions allow your Railway domain

**"Credentials not found" error:**
- Check `FIREBASE_SERVICE_ACCOUNT_JSON` is properly minified (no line breaks)
- Verify it's valid JSON

---

## What You Get (Free Tier)

✅ Live production URL
✅ Automatic HTTPS/SSL
✅ Automatic deployments from GitHub
✅ 500 hours/month ($5 credit)
✅ Enough for small-medium traffic apps

---

## Next Steps

- Monitor usage in Railway dashboard
- Set up monitoring/alerts (optional)
- Buy a custom domain (optional, ~$12/year)
- Scale up if needed (paid plans start at $20/month)

---

## Need Help?

- Railway Discord: https://discord.gg/railway
- Railway Docs: https://docs.railway.app/
- Full deployment guide: See `DEPLOYMENT.md`
