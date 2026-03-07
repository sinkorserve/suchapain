# Product Reports Map Feature Guide

## Overview

The map feature displays all product reports from your Firebase database on an interactive Google Map, allowing you to visualize where product issues are occurring geographically.

---

## Features

### ✅ What's Included:

1. **Interactive Google Map**
   - Shows all product reports as color-coded markers
   - Each marker represents one report location
   - Click markers to see report details

2. **Filtering Options**
   - Filter by **Category** (Appliance, Electronics, Furniture, Tools, Other)
   - Filter by **Make/Brand** (dynamically populated from your reports)
   - See total reports and visible reports count

3. **Privacy Respecting**
   - Shows only publicly shared information
   - If you're signed in as the report creator, you see full details
   - Anonymous users see privacy-controlled data

4. **Marker Information**
   - Color-coded by category
   - Click to see: Make/Model, Location, Serial Number (if shared), Issue description
   - Automatically zooms to fit all markers

---

## How to Use

### Step 1: Access the Map

**Option A: From Main Form Page**
1. Sign in at `http://localhost:3000/auth.html`
2. Click the **📍 View Map** button in the header

**Option B: Direct URL**
1. Go to `http://localhost:3000/map.html`
2. Map works for both signed-in and anonymous users

### Step 2: View Reports on Map

1. **Wait for map to load** - You'll see a loading spinner
2. **Markers appear** - Each colored dot is a product report
3. **Click any marker** to see details:
   - Product category and make/model
   - Location (respects privacy settings)
   - Issue description
   - Date reported
   - Serial number (if shared publicly)

### Step 3: Filter Reports

**Filter by Category:**
1. Use the **Category** dropdown in the controls bar
2. Select a category (Appliance, Electronics, etc.)
3. Map shows only matching reports

**Filter by Brand:**
1. Use the **Make/Brand** dropdown
2. Select a brand from your reports
3. Map filters to show only that brand

**Clear Filters:**
- Set dropdowns back to "All Categories" or "All Brands"

### Step 4: Navigate the Map

- **Zoom:** Scroll or use +/- buttons
- **Pan:** Click and drag
- **Street View:** Drag the yellow person icon
- **Map Type:** Use map/satellite toggle
- **Fullscreen:** Click fullscreen button

---

## Marker Colors

Each category has a unique color:

- 🔴 **Red** - Appliance
- 🔵 **Cyan** - Electronics
- 🟢 **Green** - Furniture
- 🟡 **Yellow** - Tools
- ⚪ **Gray** - Other

---

## Technical Details

### API Endpoints

**GET /api/reports/map/all**
- Fetches all reports with location data
- Optional authentication (shows more if signed in)
- Returns: Array of reports with lat/lng coordinates

**GET /api/google-maps-key**
- Provides Google Maps API key to frontend
- Keeps API key in .env (not hardcoded)

### Data Privacy

The map respects privacy settings:

**Always Shown:**
- Category, Make, Model
- ZIP code
- Nearest intersection (if available)
- Issue description
- Report date

**Conditionally Shown:**
- **Full address:** Only if `shareFullAddress: true`
- **Serial number:** Only if `shareModelNumber: true`
- **Full details:** If you're the report creator

**For Anonymous Users:**
- See all reports with privacy-controlled info
- Location markers show approximate position
- Cannot see private addresses/serial numbers

---

## Setup Instructions

### 1. Make Sure Your .env Has Google Maps API Key

```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 2. Start the Server

```bash
npm start
```

You should see:
```
✓ Google Maps initialized successfully
Server running on http://localhost:3000
```

### 3. Create Some Reports

Before the map is useful, you need reports in the database:

1. Go to `http://localhost:3000`
2. Sign in
3. Create 2-3 test reports with different addresses
4. Make sure each report has a valid address for geocoding

### 4. Open the Map

1. Go to `http://localhost:3000/map.html`
2. You should see markers for all your reports!

---

## Troubleshooting

### "No reports found"

**Cause:** No reports in Firestore database

**Solution:**
1. Create some reports first at `http://localhost:3000`
2. Make sure reports have valid addresses that geocoded successfully
3. Check Firebase Console → Firestore → `productEvents` collection

### "Error loading Google Maps"

**Cause:** Google Maps API key not configured

**Solution:**
1. Check `.env` has `GOOGLE_MAPS_API_KEY=your_key`
2. Verify API key in Google Cloud Console
3. Make sure Geocoding API AND Maps JavaScript API are both enabled
4. Restart server: `npm start`

### "Failed to load reports"

**Cause:** Server not running or API endpoint error

**Solution:**
1. Make sure server is running: `npm start`
2. Check server logs for errors
3. Try: `curl http://localhost:3000/api/reports/map/all`
4. Check Firebase is initialized correctly

### Markers don't appear

**Cause:** Reports missing location data

**Solution:**
1. Check reports have `location: { lat, lng }` in Firestore
2. Reports need valid addresses to be geocoded
3. Check geocoding worked when creating reports
4. Look for console errors (F12)

### Map shows wrong location

**Cause:** Geocoding returned incorrect coordinates

**Solution:**
1. Use more specific addresses (include city, state, ZIP)
2. Check the address in Google Maps manually
3. Update the report with a corrected address

---

## Example Usage Scenarios

### Scenario 1: Quality Control Team

"Our QA team wants to see if Samsung refrigerator failures are concentrated in certain areas"

1. Open map
2. Filter Category: "Appliance"
3. Filter Brand: "Samsung"
4. Look for marker clusters
5. Click markers to see specific issues

### Scenario 2: Customer Support

"A customer calls asking if others nearby have similar issues"

1. Customer provides address
2. Find their ZIP code on map
3. Filter by same Category and Make
4. Check if nearby markers have similar issues

### Scenario 3: Warranty Analysis

"Company wants to analyze geographic distribution of product issues"

1. Export all reports (future feature)
2. Use map to visualize hot spots
3. Filter by category to see category-specific patterns

---

## Future Enhancements

Potential improvements to the map feature:

- [ ] **Clustering:** Group nearby markers when zoomed out
- [ ] **Heatmap view:** Show density of issues
- [ ] **Time filtering:** Filter by date range
- [ ] **Export visible reports:** Download filtered data as CSV
- [ ] **Drawing tools:** Draw radius/polygon to select reports
- [ ] **Custom markers:** Upload custom icons for categories
- [ ] **Route planning:** Plan service routes for repairs

---

## Files Modified/Created

### New Files:
- `public/map.html` - Map view page with Google Maps integration
- `MAP_FEATURE_GUIDE.md` - This documentation

### Modified Files:
- `src/controllers/ProductEventController.js` - Added `getAllReportsForMap()` method
- `src/server.js` - Added `/api/reports/map/all` endpoint
- `src/routes/config.js` - Added `/api/google-maps-key` endpoint
- `public/index.html` - Added "View Map" navigation button

---

## Security Notes

### Safe to Expose:
- ✅ Google Maps API key (when properly restricted)
- ✅ Report locations (respects privacy settings)
- ✅ Public report data

### Protected:
- ❌ Private addresses (unless `shareFullAddress: true`)
- ❌ Serial numbers (unless `shareModelNumber: true`)
- ❌ User personal information

### API Key Restrictions:

Set these in Google Cloud Console → Credentials:

**HTTP Referrers:**
- `http://localhost:3000/*` (development)
- `https://yourdomain.com/*` (production)

**API Restrictions:**
- Geocoding API
- Maps JavaScript API
- Places API

---

## Testing Checklist

Before deploying:

- [ ] Create 3+ test reports with different categories
- [ ] Verify all markers appear on map
- [ ] Test filtering by category
- [ ] Test filtering by brand
- [ ] Click markers to verify info windows
- [ ] Test with signed-in user vs. anonymous
- [ ] Verify privacy settings are respected
- [ ] Check map on mobile device
- [ ] Test with no reports (graceful error)

---

## Performance Notes

- Map loads all reports at once (fine for < 1000 reports)
- For large datasets (> 1000 reports), consider:
  - Server-side pagination
  - Viewport-based loading (only load visible area)
  - Marker clustering
  - Lazy loading markers as you zoom in

Current implementation is optimized for small to medium datasets.

---

Enjoy visualizing your product reports! 🗺️
