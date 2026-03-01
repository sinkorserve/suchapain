# Product CRM Manager - Usage Examples

This guide provides detailed examples of how to use the Product CRM Manager agentapp for various tasks.

## Table of Contents

1. [Creating Product Issue Reports](#creating-product-issue-reports)
2. [Querying and Searching Reports](#querying-and-searching-reports)
3. [Managing Privacy Settings](#managing-privacy-settings)
4. [Handling Permission Requests](#handling-permission-requests)
5. [Generating Analytics Reports](#generating-analytics-reports)
6. [Exporting Data](#exporting-data)
7. [Advanced Queries](#advanced-queries)

---

## Creating Product Issue Reports

### Example 1: Basic Refrigerator Issue

**User Input:**
```
I have a Samsung refrigerator, model RF28R7351SR, that stopped cooling.
My address is 123 Main Street, San Francisco, CA 94102.
The freezer works fine but the refrigerator compartment is at 55°F instead of 37°F.
This started 3 days ago.
```

**System Response:**
```
✓ Product issue report created successfully

Report Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Report ID: rpt_001_abc123

Product Information:
  Category:     Appliance
  Make:         Samsung
  Model:        RF28R7351SR
  Model Number: [PRIVATE - not shared]

Issue:
  Refrigerator stopped cooling. Freezer works fine but refrigerator
  compartment temperature is 55°F instead of 37°F. Started 3 days ago.

Location:
  Zip Code:      94102
  Intersection:  Main St & 1st Ave
  Full Address:  [PRIVATE - not shared]

Privacy Settings:
  ✗ Full address not shared (default)
  ✗ Model number not shared (default)

Created: 2026-02-15 10:30 AM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You can change privacy settings or grant access to specific users.
Use report ID rpt_001_abc123 for future reference.
```

### Example 2: Electronics Issue with Shared Details

**User Input:**
```
Create a report for my Sony TV (XBR-65X900H).
The screen has vertical pink and green lines on the right side.
This started after a power outage.
Address: 789 Oak Avenue, San Francisco, CA 94110
I'm okay sharing my address and model number for this report.
```

**System Response:**
```
✓ Product issue report created successfully

Report Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Report ID: rpt_003_ghi789

Product Information:
  Category:     Electronics
  Make:         Sony
  Model:        XBR-65X900H
  Model Number: XBR65X900H ✓ Shared publicly

Issue:
  TV screen has vertical lines on the right side. Lines are pink
  and green. Started after power outage.

Location:
  Full Address:  789 Oak Avenue, San Francisco, CA 94110 ✓ Shared
  Zip Code:      94110
  Intersection:  Oak Ave & Valencia St

Privacy Settings:
  ✓ Full address shared
  ✓ Model number shared

Created: 2026-02-18 04:45 PM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This report is publicly visible with all details.
```

### Example 3: Quick Report

**User Input:**
```
Dishwasher (GE GDT695SSJSS) not draining. Water at bottom after cycle.
654 Broadway, SF 94133
```

**System Response:**
```
✓ Report created: rpt_005_mno345

GE GDT695SSJSS - Dishwasher not draining
Location: Near Broadway & Columbus Ave, Zip 94133
Privacy: Address and model number private (default)
```

---

## Querying and Searching Reports

### Example 4: Search by Location

**User Input:**
```
Show me all product issues in the 94102 zip code
```

**System Response:**
```
Found 3 reports in Zip Code 94102:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Report #rpt_001_abc123
   Make:       Samsung
   Model:      RF28R7351SR
   Category:   Appliance
   Issue:      Refrigerator stopped cooling
   Location:   Near Main St & 1st Ave, Zip 94102
   Created:    Feb 15, 2026
   Privacy:    🔒 Address and model number private

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. Report #rpt_002_def456
   Make:       LG
   Model:      LRFVS3006S (Model #: LRFVS3006S)
   Category:   Appliance
   Issue:      Ice maker stopped producing ice
   Location:   Near Market St & 5th St, Zip 94102
   Created:    Feb 20, 2026
   Privacy:    🔒 Address private, Model # public

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. Report #rpt_007_stu901
   Make:       Bosch
   Model:      800 Series (Model #: HBL8451UC)
   Category:   Appliance
   Issue:      Oven temperature inconsistent
   Location:   147 Polk Street, Zip 94102
   Created:    Feb 19, 2026
   Privacy:    Address and model # shared publicly

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Note: Some details are private. Request permission to view.
```

### Example 5: Search by Category and Make

**User Input:**
```
Find all Samsung appliance issues
```

**System Response:**
```
Found 1 Samsung appliance report:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Report #rpt_001_abc123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Product:
  Make:         Samsung
  Model:        RF28R7351SR
  Category:     Appliance (Refrigerator)
  Model Number: [PRIVATE]

Issue Description:
  Refrigerator stopped cooling. Freezer works fine but refrigerator
  compartment temperature is 55°F instead of 37°F. Started 3 days ago.

Location:
  Near Main St & 1st Ave
  Zip Code: 94102
  Full Address: [PRIVATE]

Status:
  Reported: Feb 15, 2026 at 10:30 AM
  Owner: user_12345

To view private details, request permission from the report owner.
```

### Example 6: Date Range Query

**User Input:**
```
Show all reports from February 20-28, 2026
```

**System Response:**
```
Found 4 reports from Feb 20-28, 2026:

1. rpt_002_def456 | Feb 20 | LG LRFVS3006S | Ice maker issue
2. rpt_006_pqr678 | Feb 22 | Apple MacBook Pro | Overheating
3. rpt_008_vwx234 | Feb 24 | Dell XPS 15 | Battery draining
4. rpt_004_jkl012 | Feb 25 | Whirlpool WFW9620HC | Grinding noise
5. rpt_005_mno345 | Feb 28 | GE GDT695SSJSS | Not draining

Use 'show details for [report ID]' to see full information.
```

---

## Managing Privacy Settings

### Example 7: Update Privacy Settings

**User Input:**
```
For report rpt_001_abc123, I want to share my model number but keep my address private
```

**System Response:**
```
✓ Privacy settings updated for report rpt_001_abc123

Updated Privacy Settings:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Report: rpt_001_abc123

Full Address:     PRIVATE 🔒 (no change)
Model Number:     PUBLIC ✓ (changed from private)

Now Showing:
  Model Number: RF28R7351SR/AA
  Location: Near Main St & 1st Ave, Zip 94102

Still Private:
  Full Address: 123 Main Street, San Francisco, CA 94102
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your model number is now visible to anyone viewing this report.
Your address remains private unless you grant specific permissions.
```

### Example 8: Make Everything Public

**User Input:**
```
Make all details public for report rpt_003_ghi789
```

**System Response:**
```
✓ All details made public for report rpt_003_ghi789

This report now shares:
  ✓ Full address: 789 Oak Avenue, San Francisco, CA 94110
  ✓ Model number: XBR65X900H
  ✓ Exact location coordinates

Anyone can now view all details of this report.
```

---

## Handling Permission Requests

### Example 9: Request Access to Private Data

**User Input:**
```
I need to see the full address and model number for report rpt_001_abc123
```

**System Response:**
```
Permission Request Created
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Report: rpt_001_abc123
Requester: user_33333
Status: PENDING

You are requesting access to:
  • Full address (currently showing: Near Main St & 1st Ave, 94102)
  • Model number (currently private)

Your request has been sent to the report owner (user_12345).
They will be notified and can approve or deny your request.

You will be notified of their decision.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Example 10: Approve Permission Request

**User Input:**
```
Approve permission request from user_44444 for my report rpt_004_jkl012
```

**System Response:**
```
✓ Permission Request Approved
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Report: rpt_004_jkl012
Requester: user_44444
Action: APPROVED
Approved: Feb 26, 2026 at 10:15 AM

User user_44444 can now view:
  • Full address: 321 Pine Street, San Francisco, CA 94108
  • Model number: WFW9620HCW

This permission is specific to this report only.
The requester has been notified.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Example 11: Deny Permission Request

**User Input:**
```
Deny the permission request from user_99999 for report rpt_008_vwx234
```

**System Response:**
```
Permission Request Denied
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Report: rpt_008_vwx234
Requester: user_99999
Action: DENIED
Denied: Feb 25, 2026 at 4:30 PM

Private information remains protected:
  🔒 Full address still private
  🔒 Model number still private

The requester has been notified of the denial.
They can only view public information about this report.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Generating Analytics Reports

### Example 12: Monthly Analytics

**User Input:**
```
Generate an analytics report for all appliance issues in February 2026
```

**System Response:**
```
✓ Analytics report generated successfully

Report saved to: product-issues-analytics-feb-2026.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Product Issue Analytics - February 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Executive Summary:
  • Total Reports: 5 appliance issues
  • Most Affected: Refrigeration (40%)
  • Top Location: Zip 94102 (60%)
  • Trending: Ice maker problems ⬆

Key Findings:
  ✓ 2 refrigeration issues in same area (potential pattern)
  ✓ Temperature control problems across brands
  ✓ 75% of users keep addresses private

Recommendations:
  → Investigate environmental factors in zip 94102
  → Monitor refrigeration product quality
  → Consider temperature sensor calibration advisory

Full report includes detailed breakdowns, charts, and privacy stats.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Example 13: Category-Specific Analytics

**User Input:**
```
Show me analytics for electronics issues only
```

**System Response:**
```
Electronics Category Analytics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Period: February 1-28, 2026
Total Electronics Reports: 3

Issues Breakdown:
  • Display Problems: 1 (33%) - Sony TV vertical lines
  • Overheating: 1 (33%) - Apple MacBook Pro
  • Battery Issues: 1 (33%) - Dell XPS 15

Brands Affected:
  1. Sony (XBR-65X900H) - Display failure post power outage
  2. Apple (MacBook Pro 16") - Thermal management issues
  3. Dell (XPS 15) - Battery drain problem

Geographic Distribution:
  • 94110: 1 report
  • 94103: 1 report
  • 94108: 1 report
  (Evenly distributed, no clustering)

Privacy Analysis:
  • 33% share full address
  • 67% share model numbers
  • 1 permission request denied

Recommendations:
  → Investigate power surge protection (1 post-outage failure)
  → Monitor thermal issues in laptops
  → Battery health diagnostics may help users
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Exporting Data

### Example 14: Export Filtered Data

**User Input:**
```
Export all reports from zip code 94102 to CSV
```

**System Response:**
```
✓ Data exported to: product-issues-94102.csv

Export Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Records: 3 reports
Format: CSV
Privacy: Respected (private fields marked [PRIVATE])

Columns Included:
  ✓ Report ID
  ✓ Category, Make, Model
  ✓ Model Number (private fields hidden)
  ✓ Issue Description
  ✓ Location (privacy-aware)
  ✓ Zip Code
  ✓ Created Date
  ✓ Privacy Flags
  ✓ Permission Request Status

File: /output/product-issues-94102.csv
Size: 1.2 KB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Private data is marked [PRIVATE] in the export.
Request permissions to view complete data.
```

### Example 15: Export with Full Access

**User Input:**
```
Export all my reports with full details (I'm the owner)
```

**System Response:**
```
✓ Full export completed: my-product-reports-full.csv

Export Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your Reports: 2
Full Access: Yes (you're the owner)
All Details Included: ✓

This export includes:
  ✓ All addresses (full details)
  ✓ All model numbers
  ✓ Exact coordinates
  ✓ Permission request details
  ✓ Complete timestamps

File: /output/my-product-reports-full.csv
Size: 0.8 KB

⚠️  This file contains private information.
    Handle securely and do not share publicly.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Advanced Queries

### Example 16: Multi-Criteria Search

**User Input:**
```
Find all Samsung and LG refrigerator issues reported in February in the 94102 area
```

**System Response:**
```
Advanced Search Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Filters Applied:
  • Makes: Samsung, LG
  • Category: Appliance (Refrigerator)
  • Date: February 2026
  • Location: Zip 94102

Found 2 matching reports:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. rpt_001_abc123 | Samsung RF28R7351SR
   Issue: Refrigerator stopped cooling
   Location: Near Main St & 1st Ave, 94102
   Date: Feb 15, 2026
   Status: Temperature 55°F (should be 37°F)

2. rpt_002_def456 | LG LRFVS3006S
   Issue: Ice maker stopped producing ice
   Location: Near Market St & 5th St, 94102
   Date: Feb 20, 2026
   Status: Water dispenser works, ice maker doesn't

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pattern Detected: Both refrigeration issues in same zip code
within 5 days. Possible environmental factor or batch issue.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Example 17: Trend Analysis

**User Input:**
```
What are the trending issues this month?
```

**System Response:**
```
Trending Issues Analysis - February 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 HOT TREND: Refrigeration Problems ⬆ +40%
   • 2 reports this month (vs avg 1.2/month)
   • Both in zip 94102
   • Different brands (Samsung, LG)
   • Possible environmental correlation

⚡ EMERGING: Post-Power Outage Failures
   • 1 explicit report (Sony TV)
   • May be underreported
   • Recommend power surge investigation

🌡️  STEADY: Temperature Control Issues
   • 3 reports across categories
   • Refrigerator, oven, laptop all affected
   • Common failure mode across product types

📱 DECLINING: Mobile/Portable Electronics ⬇
   • 0 smartphone issues this month
   • 2 laptop issues (stable)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Recommendation: Focus on refrigeration issues in 94102 area.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Tips for Best Results

### 1. Provide Complete Information
Include all relevant details when creating reports:
- Full product model numbers
- Detailed issue descriptions
- Complete addresses (you can always make them private)
- When the issue started

### 2. Use Clear Privacy Preferences
Be explicit about what you want to share:
- "Keep my address private"
- "Share model number publicly"
- "Make everything public"

### 3. Search Effectively
Use specific criteria for better results:
- Exact zip codes
- Specific brands or models
- Date ranges
- Categories

### 4. Monitor Trends
Regularly review analytics to:
- Identify patterns
- Spot geographic clusters
- Track issue evolution
- Make informed decisions

### 5. Manage Permissions Wisely
- Review permission requests carefully
- Grant access when appropriate for collaboration
- Deny when privacy is paramount
- You can always revoke access later

---

For more information, see:
- README.md - Complete agentapp overview
- SETUP_GUIDE.md - Installation and configuration
- Examples folder - Sample data and reports
