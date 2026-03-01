# Product CRM Manager

AI-powered product issue tracking and CRM management system with privacy-aware data handling, geocoding, and permission management.

## Overview

The Product CRM Manager is a CREAO agentapp designed to help organizations manage product issue reports while respecting user privacy. It provides intelligent data collection, geocoding, privacy controls, and analytics.

## Key Features

### 1. Create Product Issue Reports
- Collect comprehensive product information (category, make, model, model number)
- Capture detailed issue descriptions
- Geocode addresses to extract zip codes and nearest intersections
- Apply privacy settings (share full address? share model number?)
- Store securely in Firestore with proper privacy flags

### 2. Query and Analyze Reports
- Search reports by category, make, model, or location
- Filter by date range and issue type
- Generate summaries and analytics
- Respect privacy settings when displaying data

### 3. Manage Privacy and Permissions
- Handle permission requests from users wanting access to private data
- Approve/deny access requests
- Update privacy settings for existing reports
- Explain privacy implications to users

### 4. Generate Reports and Exports
- Create CSV exports of filtered data
- Generate summary statistics and analytics
- Create visualizations of issue patterns
- Always respect data privacy in exports

## Privacy-First Design

### Default Privacy Settings
- Full addresses are **hidden** by default (only zip code and nearest intersection shown)
- Model numbers are **hidden** by default
- Users must explicitly consent to share detailed information

### Data Access Control
- Report owners have full access to their own data
- Other users can request permission to view private data
- Permissions must be explicitly approved by report owners
- All exports respect privacy settings

## Data Structure

### ProductEvent
```javascript
{
  // Product Information
  category: string,           // e.g., "Appliance", "Electronics"
  make: string,              // Manufacturer
  model: string,             // Product model
  modelNumber: string,       // PRIVATE by default

  // Issue Details
  issue: string,             // Description of the problem

  // Location Data
  address: string,           // PRIVATE - full address
  zipCode: string,           // PUBLIC - extracted from address
  nearestIntersection: string, // PUBLIC - for approximate location
  location: {                // PRIVATE - exact coordinates
    lat: number,
    lng: number
  },
  displayLocation: {         // PUBLIC - zip code center
    lat: number,
    lng: number
  },

  // Privacy Controls
  shareFullAddress: boolean,    // Consent flag
  shareModelNumber: boolean,    // Consent flag

  // Metadata
  createdBy: string,         // User ID
  createdAt: timestamp,
  permissionRequests: [      // Array of access requests
    {
      requesterId: string,
      status: "pending" | "approved" | "denied",
      requestedAt: timestamp
    }
  ]
}
```

## Required Capabilities

### Firebase Firestore
- **Collection:** `product_events`
- **Purpose:** Store all product issue reports
- **Authentication:** Required for `createdBy` field

### Google Maps Geocoding API
- **Purpose:** Convert addresses to coordinates
- **Features Used:**
  - Extract zip codes
  - Find nearest intersections
  - Generate both exact and approximate locations

## Workflow Examples

### Creating a Report
1. User provides: category, make, model, model number, issue description, address
2. System geocodes the address to get:
   - Exact coordinates (stored privately)
   - Zip code (public)
   - Nearest intersection (public)
   - Approximate display location (zip code center, public)
3. Apply default privacy settings (addresses and model numbers hidden)
4. Store in Firestore with user ID
5. Return report ID confirmation

### Querying Reports
1. User specifies search criteria (category, make, model, location, date range)
2. System constructs Firestore query
3. Apply privacy filtering:
   - Show all public data
   - Show private data only if: user is owner OR has approved permission
4. Present results in structured format

### Handling Permission Requests
1. User requests access to private data in a specific report
2. System creates permission request record
3. Report owner reviews and approves/denies
4. Requester is notified of decision
5. If approved, requester can now view private data for that report

## Templates

### Analytics Report Template
Located at: `agentapp-templates/analytics-report-template.md`

Generates comprehensive analytics including:
- Executive summary with key metrics
- Issues by category breakdown
- Top manufacturers with issues
- Geographic distribution
- Common issue patterns
- Trending issues
- Privacy statistics
- Recommendations

### CSV Export Template
Located at: `agentapp-templates/export-csv-template.csv`

Exports data with columns:
- Report ID
- Category, Make, Model
- Model Number (respects privacy)
- Issue description
- Location (respects privacy)
- Zip Code
- Created Date
- Privacy flags
- Permission request status

## Usage Examples

### Example 1: Create a Report
```
User: "I have a Samsung refrigerator (model RF28R7351SR) that stopped cooling.
       Address: 123 Main St, San Francisco, CA 94102"

System Response:
✓ Report created successfully
  - Report ID: abc123xyz
  - Category: Appliance
  - Make: Samsung
  - Model: RF28R7351SR
  - Issue: Stopped cooling
  - Location: Zip 94102, near Main St & 1st Ave
  - Privacy: Address and model number are private (default)
  - You can change privacy settings or grant access on request
```

### Example 2: Query Reports
```
User: "Show me all refrigerator issues in the 94102 zip code"

System Response:
Found 5 reports:

1. Report #abc123
   - Make: Samsung
   - Model: RF28R7351SR (model # private)
   - Issue: Stopped cooling
   - Location: Zip 94102, near Main St & 1st Ave
   - Created: 2026-02-15

2. Report #def456
   - Make: LG
   - Model: LRFVS3006S (model # shared)
   - Issue: Ice maker malfunction
   - Location: Zip 94102, near Market St & 5th St
   - Created: 2026-02-20

[Privacy note: Some details hidden. Request permission to view private data.]
```

### Example 3: Generate Analytics
```
User: "Generate an analytics report for all appliance issues this month"

System Response:
✓ Analytics report generated: product-issues-analytics-2026-02.md

Executive Summary:
- Total Reports: 47
- Most Affected Category: Refrigerators (23 reports)
- Geographic Concentration: Zip 94102 (12 reports)
- Trending Issue: Ice maker problems (increasing 40% vs last month)

Full report includes category breakdowns, manufacturer analysis,
geographic distribution, and recommendations.
```

## Installation & Setup

### Required Tools
1. **Firebase MCP Tool** - For Firestore data storage
2. **Google Maps MCP Tool** - For geocoding addresses

### Configuration
1. Add Firebase and Google Maps tools to your CREAO workspace
2. Configure Firebase with your project credentials
3. Configure Google Maps API key
4. Create `product_events` collection in Firestore

## Privacy Compliance

This system is designed with privacy-first principles:
- **Data minimization**: Only collect necessary information
- **Consent-based sharing**: All private data requires explicit consent
- **Access control**: Granular permission system
- **Transparency**: Clear privacy indicators and explanations
- **User control**: Report owners control access to their data

## Support

For questions or issues with the Product CRM Manager agentapp:
- Review this documentation
- Check the example workflows above
- Ensure required capabilities (Firebase, Google Maps) are installed
- Verify privacy settings are understood and configured correctly
