# Product CRM Manager - Testing Guide

This guide will help you test the Product CRM Manager application step by step.

## Overview

The Product CRM Manager is designed to run as a **CREAO agentapp**, not as a standalone Node.js application. This means it's meant to be used within the CREAO platform with AI agent interaction.

## Important Note

⚠️ **This is NOT a traditional web application.**

This app is:
- **Agent-native**: Designed to work with CREAO's AI agents
- **Conversational**: Users interact via natural language, not a UI
- **MCP-based**: Uses Model Context Protocol tools (Firebase, Google Maps)

## Testing Approaches

### Option 1: Test in CREAO Platform (Recommended)

This is how the app is **intended to be used**.

#### Prerequisites
1. Access to CREAO platform
2. Firebase MCP tool installed and configured
3. Google Maps MCP tool installed and configured

#### Testing Steps

**Step 1: Install as an Agentapp**
```
1. Log into CREAO platform
2. Navigate to your workspace
3. Install the Product CRM Manager agentapp (miniapp_id: xGkKIl2Rjj)
4. Ensure Firebase and Google Maps tools are connected
```

**Step 2: Test Creating a Report**
```
User message to agent:
"I have a Samsung refrigerator (model RF28R7351SR) that stopped cooling.
My address is 123 Main Street, San Francisco, CA 94102."

Expected agent response:
✓ Creates report in Firestore
✓ Geocodes the address
✓ Applies privacy defaults
✓ Returns report ID
```

**Step 3: Test Querying Reports**
```
User: "Show all reports in zip code 94102"

Expected:
✓ Queries Firestore
✓ Filters by zip code
✓ Respects privacy settings
✓ Returns formatted list
```

**Step 4: Test Analytics**
```
User: "Generate an analytics report for all appliance issues"

Expected:
✓ Analyzes data
✓ Generates markdown report
✓ Includes trends and recommendations
```

**Step 5: Test Privacy Controls**
```
User: "Make my address public for report rpt_001"

Expected:
✓ Updates privacy flags in Firestore
✓ Confirms changes
```

---

### Option 2: Test Code Components Locally

If you want to test the **code itself** without the full CREAO platform:

#### Prerequisites
```bash
# Install Node.js (v16 or higher)
node --version

# Install dependencies
npm install
```

#### Required Dependencies

Add these to package.json if not already present:
```json
{
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "@google/maps": "^2.0.0"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  }
}
```

#### Set Up Test Environment

**1. Create a `.env` file:**
```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Google Maps API Key
GOOGLE_MAPS_API_KEY=your-api-key
```

**2. Run Unit Tests:**
```bash
# Run the existing test file
npm test

# Or run with Jest directly
npx jest tests/ProductEvent.test.js
```

---

### Option 3: Test Individual Components

You can test each service independently:

#### Test 1: Geocoding Service

Create a test file `test-geocoding.js`:
```javascript
const GeocodingService = require('./src/services/GeocodingService');

async function testGeocoding() {
  const geocoder = new GeocodingService(process.env.GOOGLE_MAPS_API_KEY);

  const result = await geocoder.geocodeAddress(
    '123 Main Street, San Francisco, CA 94102'
  );

  console.log('Geocoding Result:', result);
  // Should return: {lat, lng, zipCode, nearestIntersection}
}

testGeocoding();
```

Run it:
```bash
node test-geocoding.js
```

Expected output:
```
Geocoding Result: {
  lat: 37.7749,
  lng: -122.4194,
  zipCode: '94102',
  nearestIntersection: 'Main St & 1st Ave'
}
```

#### Test 2: Firebase Service

Create `test-firebase.js`:
```javascript
const FirebaseService = require('./src/services/FirebaseService');

async function testFirebase() {
  const firebase = new FirebaseService({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  });

  // Test creating a report
  const reportData = {
    category: 'Appliance',
    make: 'Samsung',
    model: 'RF28R7351SR',
    issue: 'Not cooling',
    zipCode: '94102',
    createdBy: 'test-user-123'
  };

  const reportId = await firebase.createReport(reportData);
  console.log('Created report:', reportId);

  // Test querying
  const reports = await firebase.getReportsByZip('94102');
  console.log('Found reports:', reports.length);
}

testFirebase();
```

Run it:
```bash
node test-firebase.js
```

#### Test 3: Export Service

Create `test-export.js`:
```javascript
const ExportService = require('./src/utils/ExportService');
const sampleData = require('./examples/sample-product-issues.json');

async function testExport() {
  const exporter = new ExportService();

  // Test CSV export
  const csv = exporter.exportToCSV(sampleData);
  console.log('CSV Export:');
  console.log(csv);

  // Test Analytics
  const analytics = exporter.generateAnalytics(sampleData);
  console.log('Analytics:');
  console.log(analytics);
}

testExport();
```

Run it:
```bash
node test-export.js
```

---

### Option 4: Manual Testing with Sample Data

The easiest way to see the app working without external services:

**1. View Sample Data:**
```bash
# See example product issues
cat examples/sample-product-issues.json

# See example analytics report
cat examples/sample-analytics-report.md

# See example CSV export
cat examples/sample-export.csv
```

**2. Understand the Data Flow:**
```
User Input (via agent)
  → GeocodingService (converts address to coordinates)
  → ProductEventController (applies privacy logic)
  → FirebaseService (stores in Firestore)
  → Response to user
```

**3. Test Privacy Logic Locally:**

Create `test-privacy.js`:
```javascript
const ProductEvent = require('./src/models/ProductEvent');

// Create a product event
const event = new ProductEvent({
  category: 'Appliance',
  make: 'Samsung',
  model: 'RF28R7351SR',
  modelNumber: 'RF28R7351SR/AA',
  issue: 'Not cooling',
  address: '123 Main St, SF, CA 94102',
  zipCode: '94102',
  nearestIntersection: 'Main St & 1st Ave'
});

console.log('With default privacy (private):');
console.log(event.getPublicView());

// Change privacy settings
event.shareFullAddress = true;
event.shareModelNumber = true;

console.log('\nWith all data public:');
console.log(event.getPublicView());
```

Run it:
```bash
node test-privacy.js
```

---

## Testing Checklist

### ✅ Core Functionality
- [ ] Geocoding works (converts addresses to coordinates)
- [ ] Privacy defaults are applied (address & model # private)
- [ ] Reports are stored in Firebase
- [ ] Reports can be queried by various criteria
- [ ] Analytics reports can be generated
- [ ] CSV exports work with privacy respected

### ✅ Privacy Features
- [ ] Default privacy is most restrictive
- [ ] Users can change privacy settings
- [ ] Public view hides private data
- [ ] Permission requests can be created
- [ ] Permission requests can be approved/denied

### ✅ Data Integrity
- [ ] Required fields are validated
- [ ] Geocoded data is accurate
- [ ] Timestamps are recorded correctly
- [ ] User IDs are tracked properly

### ✅ Error Handling
- [ ] Invalid addresses are handled gracefully
- [ ] Missing required fields trigger errors
- [ ] Firebase connection failures are caught
- [ ] API rate limits are respected

---

## Quick Test Without Setup

If you just want to see what the app does **without any configuration**:

```bash
# 1. View the README
cat README.md

# 2. Look at sample data
cat examples/sample-product-issues.json | head -50

# 3. See an example analytics report
cat examples/sample-analytics-report.md

# 4. Check the data model
cat src/models/ProductEvent.js

# 5. Review the controller logic
cat src/controllers/ProductEventController.js
```

This will give you a complete understanding of how the app works without needing to run anything.

---

## Deployment Options

### For CREAO Platform (Recommended)
This app is **already deployed** as a CREAO agentapp (miniapp_id: xGkKIl2Rjj). Users can reuse it directly in CREAO.

### For Standalone Deployment (Not Recommended)
If you want to run this outside CREAO:

1. **Add REST API**: Wrap the controllers with Express.js endpoints
2. **Add Frontend**: Create a web UI for user interaction
3. **Deploy to Cloud**: Use services like Heroku, Vercel, or Google Cloud

But this defeats the purpose - it's designed as an agent-native app!

---

## Common Issues & Solutions

### "Module not found" errors
```bash
npm install
```

### "Firebase credentials invalid"
- Check your .env file
- Verify credentials in Firebase Console
- Ensure service account has proper permissions

### "Google Maps API error"
- Verify API key is valid
- Check that Geocoding API is enabled
- Ensure billing is set up (Google Maps requires it)

### "Cannot connect to Firestore"
- Check internet connection
- Verify Firebase project ID
- Ensure Firestore is enabled in your project

---

## Need Help?

1. **Review Documentation**:
   - README.md - Full overview
   - SETUP_GUIDE.md - Configuration help
   - USAGE_EXAMPLES.md - Example interactions
   - API_DOCUMENTATION.md - API details

2. **Check Examples**:
   - examples/sample-product-issues.json
   - examples/sample-analytics-report.md
   - examples/sample-export.csv

3. **Verify Configuration**:
   - Firebase credentials
   - Google Maps API key
   - CREAO workspace tools

---

## Summary

**For CREAO Users**: Install the agentapp and interact with it via natural language

**For Developers**: Review the code, run unit tests, test individual components

**For Exploration**: Read the docs and examine the sample data

The app is ready to use in CREAO - no additional deployment needed!
