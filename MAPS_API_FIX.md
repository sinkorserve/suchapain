# Fixing Google Maps JavaScript API Error

## Error You're Seeing

```
Google Maps JavaScript API error: ApiTargetBlockedMapError
```

This means the **Maps JavaScript API** is not enabled for your project.

---

## Quick Fix (2 minutes)

### Step 1: Enable Maps JavaScript API

1. Go to [Google Cloud Console - APIs & Services](https://console.cloud.google.com/apis/library)
2. Make sure you're in the correct project (check project dropdown at top)
3. Search for: **"Maps JavaScript API"**
4. Click on it
5. Click **ENABLE**
6. Wait 1-2 minutes for it to activate

### Step 2: Update API Key Restrictions (Important!)

Your API key needs to allow BOTH APIs:

1. Go to [Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your API key
3. Scroll to **API restrictions**
4. Select **Restrict key**
5. Check these APIs:
   - ✅ **Geocoding API** (for address lookup)
   - ✅ **Maps JavaScript API** (for displaying the map)
   - ✅ **Places API** (optional, for autocomplete)
6. Click **SAVE**

### Step 3: Test Again

1. Wait 2-3 minutes for changes to propagate
2. Refresh `http://localhost:3000/map.html`
3. The map should load!

---

## What's the Difference?

You currently have these APIs enabled:

| API | Purpose | Status |
|-----|---------|--------|
| **Geocoding API** | Convert addresses to lat/lng | ✅ Enabled (working) |
| **Maps JavaScript API** | Display interactive maps | ❌ **Not enabled** |

**Both are needed for the app:**
- **Geocoding API** - Used when creating reports (converts address to coordinates)
- **Maps JavaScript API** - Used in map.html (displays the interactive map)

---

## Troubleshooting

### Still getting the error after enabling?

**Wait 2-5 minutes:**
- API enablement takes time to propagate
- Clear browser cache
- Try in Incognito/Private window

**Check you enabled it on the CORRECT project:**
1. In Google Cloud Console, verify the project name at top
2. Should match your Firebase project: `suchapain`
3. If wrong project, switch and enable it there

**Check API key restrictions:**
1. Make sure your API key has BOTH APIs checked
2. HTTP referrer restrictions should include `http://localhost:3000/*`

### "Billing required" error

Maps JavaScript API requires billing enabled:
- Make sure your GCP project has billing
- You already solved this for Geocoding API
- Same billing account works for Maps JavaScript API

### Different error message?

Share the exact error and I'll help debug it.

---

## API Key Restrictions - Complete Setup

For security, your API key should have:

### Application Restrictions:
**HTTP referrers (web sites):**
```
http://localhost:3000/*
http://127.0.0.1:3000/*
https://yourdomain.com/*  (when you deploy)
```

### API Restrictions:
**Restrict key to these APIs:**
- ✅ Geocoding API
- ✅ Maps JavaScript API
- ✅ Places API (optional)
- ✅ Directions API (optional, for future features)

---

## Cost Information

**Maps JavaScript API Pricing:**
- **Free:** $200/month credit (covers ~28,000 map loads)
- **After free tier:** $7 per 1,000 map loads
- **For development:** Should stay well within free tier

**Your current usage estimate:**
- Testing/development: < 100 map loads/month
- Cost: $0 (within free tier)

See: [Google Maps Pricing](https://mapsplatform.google.com/pricing/)

---

## Quick Summary

**The fix:**
1. Enable **Maps JavaScript API** in Google Cloud Console
2. Update API key to allow both Geocoding API AND Maps JavaScript API
3. Wait 2-3 minutes
4. Refresh map.html

**Why this happened:**
- Geocoding API was enabled (for creating reports)
- Maps JavaScript API was NOT enabled (needed for displaying the map)
- Different APIs serve different purposes

---

After enabling Maps JavaScript API, your map will work perfectly! 🗺️
