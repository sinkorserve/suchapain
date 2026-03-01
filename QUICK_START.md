# Product CRM Manager - Quick Start Guide

Get started with the Product CRM Manager in 5 minutes.

## What is this?

Product CRM Manager is a privacy-first system for tracking and managing product issue reports. It helps you:
- 📝 Collect detailed product issue information
- 🌍 Geocode addresses automatically
- 🔒 Protect user privacy by default
- 📊 Generate analytics and insights
- 📤 Export data for further analysis

## Prerequisites

You need two tools installed in your CREAO workspace:
1. **Firebase** (for data storage)
2. **Google Maps** (for geocoding)

Don't have them? See [SETUP_GUIDE.md](SETUP_GUIDE.md) for installation instructions.

## Your First Report

### Step 1: Create a Report

Simply tell the system about your product issue:

```
"I have a Samsung refrigerator (model RF28R7351SR) that stopped cooling.
My address is 123 Main St, San Francisco, CA 94102."
```

The system will:
- ✓ Extract product details
- ✓ Geocode your address
- ✓ Set privacy defaults (address & model number private)
- ✓ Store in Firestore
- ✓ Return a report ID

### Step 2: View Your Report

```
"Show me report rpt_001_abc123"
```

You'll see all details since you're the owner.

### Step 3: Query Reports

```
"Show all reports in zip code 94102"
```

You'll see reports with privacy settings respected.

## Key Commands

### Creating Reports
- "Create a report for [product] with [issue] at [address]"
- "Log an issue: [details]"
- "Report problem with [product]"

### Searching
- "Show all reports in [zip code]"
- "Find [brand] issues"
- "Search for [category] problems"
- "Reports from [date] to [date]"

### Privacy Management
- "Make [field] public for report [ID]"
- "Keep [field] private"
- "Share all details for [report ID]"

### Analytics
- "Generate analytics report"
- "Show trends this month"
- "Analyze [category] issues"

### Exporting
- "Export all reports to CSV"
- "Export [filtered] data"

## Privacy Quick Reference

### Default Privacy (Most Secure)
- ✗ Full address **hidden** (shows zip + intersection)
- ✗ Model number **hidden**
- ✓ Category, make, model **visible**
- ✓ Issue description **visible**

### Sharing Options
1. **Keep Default**: Maximum privacy
2. **Share Selectively**: Choose specific fields
3. **Share All**: Full transparency

### Permission System
- Others can **request** access to your private data
- You **approve or deny** each request
- Permissions are **per-report**

## Understanding Locations

The system creates TWO location representations:

### Private Location (🔒 Not Shared)
- Exact coordinates from your full address
- Only you (owner) can see
- Used internally for precise mapping

### Public Location (✓ Shared)
- Zip code center coordinates
- Nearest intersection name
- Approximate area only

Example:
- **You see:** "123 Main Street, San Francisco, CA 94102"
- **Others see:** "Near Main St & 1st Ave, Zip 94102"

## Common Workflows

### Workflow 1: Report and Share
```
1. Create report with full details
2. System sets everything private (default)
3. Later: "Make model number public for report [ID]"
4. Share report ID with collaborators
```

### Workflow 2: Private Reporting
```
1. Create report
2. Keep all defaults (private)
3. Only grant access to specific users on request
```

### Workflow 3: Public Reporting
```
1. Create report
2. "Make all details public for report [ID]"
3. Anyone can see everything
```

### Workflow 4: Analytics
```
1. Accumulate reports over time
2. "Generate analytics for [period/category]"
3. Review trends and patterns
4. Export data if needed
```

## Example Session

```
You: "I have a broken dishwasher. GE model GDT695SSJSS.
      Won't drain properly. Address: 654 Broadway, SF 94133."

System: "✓ Report created: rpt_005_mno345
         Privacy: Address and model number are private (default)"

You: "Show all dishwasher issues"

System: "Found 1 report:
         - GE GDT695SSJSS (model # private)
         - Not draining properly
         - Near Broadway & Columbus Ave, Zip 94133"

You: "Make model number public for rpt_005_mno345"

System: "✓ Model number now public: GDT695SSJSS"

You: "Generate analytics"

System: "✓ Analytics generated
         - 1 dishwasher issue
         - Common problem: drainage
         - Report saved to analytics-report.md"
```

## Files and Templates

This agentapp includes:

### Documentation
- `README.md` - Complete overview
- `SETUP_GUIDE.md` - Installation steps
- `USAGE_EXAMPLES.md` - Detailed examples
- `QUICK_START.md` - This file

### Templates
- `agentapp-templates/analytics-report-template.md` - Analytics format
- `agentapp-templates/export-csv-template.csv` - Export format

### Examples
- `examples/sample-product-issues.json` - Sample data
- `examples/sample-analytics-report.md` - Example analytics
- `examples/sample-export.csv` - Example export

## Troubleshooting

### "Cannot connect to Firebase"
→ Verify Firebase tool is installed and configured

### "Geocoding failed"
→ Check Google Maps tool credentials

### "Permission denied"
→ You need to be the owner or have approved permission

### "No reports found"
→ Check your search filters or create some reports first

## Next Steps

1. **Read the full documentation**: [README.md](README.md)
2. **Review examples**: Check the `examples/` folder
3. **Create your first report**: Start logging issues
4. **Explore analytics**: Generate insights from your data
5. **Configure privacy**: Set up defaults that work for you

## Getting Help

- Review [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) for detailed scenarios
- Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for configuration help
- Examine sample data in `examples/` folder

## Privacy Reminder

🔒 **This system is privacy-first by design**

- Defaults to most private settings
- Requires explicit consent to share
- Granular permission controls
- Complete transparency about what's shared

You're always in control of your data.

---

**Ready to start?** Create your first report now!
