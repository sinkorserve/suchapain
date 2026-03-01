# Product CRM Manager - Setup Guide

## Prerequisites

Before using the Product CRM Manager agentapp, you need to install and configure the required tools in your CREAO workspace.

## Required Capabilities

### 1. Firebase (Firestore Database)

**Purpose:** Store and manage product issue reports

**Setup Steps:**
1. Install the Firebase MCP tool in your CREAO workspace
2. Create a Firebase project at https://console.firebase.google.com
3. Enable Firestore Database in your Firebase project
4. Create a collection named `product_events`
5. Configure authentication to get user IDs
6. Add Firebase credentials to your CREAO workspace

**Collection Structure:**
```
product_events/
  ├── [reportId]/
  │   ├── category: string
  │   ├── make: string
  │   ├── model: string
  │   ├── modelNumber: string
  │   ├── issue: string
  │   ├── address: string
  │   ├── zipCode: string
  │   ├── nearestIntersection: string
  │   ├── location: {lat, lng}
  │   ├── displayLocation: {lat, lng}
  │   ├── shareFullAddress: boolean
  │   ├── shareModelNumber: boolean
  │   ├── createdBy: string
  │   ├── createdAt: timestamp
  │   └── permissionRequests: array
```

**Firestore Security Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /product_events/{reportId} {
      // Allow users to read their own reports
      allow read: if request.auth != null &&
                     resource.data.createdBy == request.auth.uid;

      // Allow users to create reports
      allow create: if request.auth != null &&
                       request.resource.data.createdBy == request.auth.uid;

      // Allow users to update their own reports
      allow update: if request.auth != null &&
                       resource.data.createdBy == request.auth.uid;

      // Public read for public data only
      allow read: if request.auth != null;
    }
  }
}
```

### 2. Google Maps (Geocoding API)

**Purpose:** Convert addresses to coordinates and extract location details

**Setup Steps:**
1. Install the Google Maps MCP tool in your CREAO workspace
2. Create a Google Cloud project at https://console.cloud.google.com
3. Enable the Geocoding API
4. Create an API key with Geocoding API access
5. Add API key to your CREAO workspace

**API Usage:**
- Endpoint: `https://maps.googleapis.com/maps/api/geocode/json`
- Parameters: `address`, `key`
- Returns: coordinates, zip code, address components

## Installation Steps

### Step 1: Install Required Tools

In your CREAO workspace:

```bash
# Search for Firebase tool
Search for "Firebase" in CREAO platform tools

# Search for Google Maps tool
Search for "Google Maps" in CREAO platform tools

# Install both tools
Install Firebase MCP tool
Install Google Maps MCP tool
```

### Step 2: Configure Firebase

1. Create Firebase project
2. Copy your Firebase configuration
3. Add to CREAO workspace credentials
4. Create `product_events` collection
5. Set up security rules (see above)

### Step 3: Configure Google Maps

1. Create Google Cloud project
2. Enable Geocoding API
3. Create API key
4. Add API key to CREAO workspace credentials

### Step 4: Verify Setup

Run this verification checklist:

- [ ] Firebase MCP tool installed
- [ ] Google Maps MCP tool installed
- [ ] Firebase credentials configured
- [ ] Google Maps API key configured
- [ ] `product_events` collection exists
- [ ] Firestore security rules applied
- [ ] Test geocoding with a sample address
- [ ] Test creating a sample report

## Configuration Examples

### Firebase Configuration
```json
{
  "apiKey": "YOUR_FIREBASE_API_KEY",
  "authDomain": "your-project.firebaseapp.com",
  "projectId": "your-project-id",
  "storageBucket": "your-project.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:web:abcdef123456"
}
```

### Google Maps Configuration
```json
{
  "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
}
```

## Testing Your Setup

### Test 1: Geocoding
```
User: "Geocode this address: 123 Main St, San Francisco, CA 94102"

Expected Response:
✓ Address geocoded successfully
  - Coordinates: 37.7749, -122.4194
  - Zip Code: 94102
  - Nearest Intersection: Main St & 1st Ave
```

### Test 2: Create Report
```
User: "Create a test product issue report"

Expected Response:
✓ Report created with ID: [report-id]
✓ Stored in Firestore
✓ Privacy settings applied
```

### Test 3: Query Reports
```
User: "Show all reports"

Expected Response:
Found X reports:
[List of reports with privacy respected]
```

## Troubleshooting

### Issue: Cannot connect to Firebase
**Solution:**
- Verify Firebase credentials are correct
- Check if Firestore is enabled in your Firebase project
- Ensure network access to Firebase

### Issue: Geocoding fails
**Solution:**
- Verify Google Maps API key is valid
- Check if Geocoding API is enabled
- Ensure API key has no restrictions blocking usage

### Issue: Permission denied errors
**Solution:**
- Review Firestore security rules
- Verify user is authenticated
- Check that user IDs match

### Issue: Reports not appearing
**Solution:**
- Check if reports are being created in correct collection
- Verify query filters
- Check privacy settings aren't hiding all data

## Security Best Practices

1. **API Keys:**
   - Never commit API keys to version control
   - Use environment variables
   - Rotate keys regularly

2. **Firestore Security:**
   - Always use security rules
   - Never allow public write access
   - Validate data on write

3. **Privacy:**
   - Default to most restrictive settings
   - Require explicit consent for sharing
   - Audit permission grants regularly

4. **Authentication:**
   - Always authenticate users
   - Use Firebase Authentication
   - Validate user IDs on all operations

## Next Steps

After setup is complete:

1. Review the main README.md for usage examples
2. Explore sample data in `examples/`
3. Test creating your first product issue report
4. Generate your first analytics report
5. Familiarize yourself with privacy controls

## Support

If you encounter issues during setup:

1. Check this guide's troubleshooting section
2. Review Firebase and Google Maps documentation
3. Verify all credentials and configurations
4. Test each component independently

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding)
- [CREAO Platform Tools](https://creao.ai/tools)
- Product CRM Manager README.md
