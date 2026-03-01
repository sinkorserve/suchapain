# Product CRM Manager API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
All requests should include a `x-user-id` header with the user's ID:
```
x-user-id: user123
```

## Endpoints

### 1. Create Product Report

Create a new product issue report with automatic geocoding and privacy controls.

**Endpoint:** `POST /api/reports`

**Request Body:**
```json
{
  "category": "Appliance",
  "make": "Samsung",
  "model": "RF28R7351SR",
  "modelNumber": "RF28R7351SR/AA",
  "issue": "Refrigerator stopped cooling after 2 years",
  "address": "123 Main St, San Francisco, CA 94102",
  "shareFullAddress": false,
  "shareModelNumber": false
}
```

**Response:**
```json
{
  "success": true,
  "reportId": "abc123xyz",
  "message": "Report created successfully",
  "details": {
    "category": "Appliance",
    "make": "Samsung",
    "model": "RF28R7351SR",
    "zipCode": "94102",
    "nearestIntersection": "Main St & 1st Ave",
    "privacySettings": {
      "shareFullAddress": false,
      "shareModelNumber": false
    }
  }
}
```

---

### 2. Get Specific Report

Retrieve a specific report by ID. Private data is shown based on permissions.

**Endpoint:** `GET /api/reports/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "category": "Appliance",
    "make": "Samsung",
    "model": "RF28R7351SR",
    "modelNumber": "[PRIVATE]",
    "issue": "Refrigerator stopped cooling after 2 years",
    "address": "[PRIVATE]",
    "zipCode": "94102",
    "nearestIntersection": "Main St & 1st Ave",
    "location": {
      "lat": 37.7750,
      "lng": -122.4195
    },
    "createdAt": "2026-02-28T10:30:00Z",
    "permissionRequests": 2
  }
}
```

---

### 3. Query Reports

Search reports with multiple filter options.

**Endpoint:** `GET /api/reports`

**Query Parameters:**
- `category` (string): Filter by product category
- `make` (string): Filter by manufacturer
- `model` (string): Filter by product model
- `zipCode` (string): Filter by zip code
- `createdBy` (string): Filter by creator user ID
- `startDate` (ISO date): Filter by creation date (start)
- `endDate` (ISO date): Filter by creation date (end)
- `limit` (number): Maximum number of results

**Example:**
```
GET /api/reports?category=Appliance&zipCode=94102&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "category": "Appliance",
      "make": "Samsung",
      "model": "RF28R7351SR",
      "modelNumber": "[PRIVATE]",
      "issue": "Stopped cooling",
      "zipCode": "94102",
      "nearestIntersection": "Main St & 1st Ave",
      "createdAt": "2026-02-28T10:30:00Z"
    }
  ],
  "count": 1
}
```

---

### 4. Request Permission

Request permission to view private data in a report.

**Endpoint:** `POST /api/reports/:id/permissions`

**Response:**
```json
{
  "success": true,
  "message": "Permission request created",
  "request": {
    "requesterId": "user456",
    "status": "pending",
    "requestedAt": "2026-02-28T11:00:00Z"
  }
}
```

---

### 5. Handle Permission Request

Approve or deny a permission request (owner only).

**Endpoint:** `PUT /api/reports/:id/permissions/:requesterId`

**Request Body:**
```json
{
  "decision": "approved"
}
```

Allowed values: `"approved"` or `"denied"`

**Response:**
```json
{
  "success": true,
  "message": "Permission approved",
  "request": {
    "requesterId": "user456",
    "status": "approved",
    "decidedAt": "2026-02-28T11:05:00Z"
  }
}
```

---

### 6. Update Privacy Settings

Update privacy settings for a report (owner only).

**Endpoint:** `PATCH /api/reports/:id/privacy`

**Request Body:**
```json
{
  "shareFullAddress": true,
  "shareModelNumber": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Privacy settings updated",
  "settings": {
    "shareFullAddress": true,
    "shareModelNumber": false
  }
}
```

---

### 7. Get Analytics

Generate analytics data for reports.

**Endpoint:** `GET /api/analytics`

**Query Parameters:**
- `category` (string): Filter by category
- `make` (string): Filter by manufacturer
- `zipCode` (string): Filter by zip code
- `startDate` (ISO date): Filter by date range (start)
- `endDate` (ISO date): Filter by date range (end)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalReports": 47,
    "byCategory": {
      "Appliance": 23,
      "Electronics": 15,
      "HVAC": 9
    },
    "byMake": {
      "Samsung": 12,
      "LG": 10,
      "Whirlpool": 8
    },
    "byZipCode": {
      "94102": 12,
      "94103": 8,
      "94104": 6
    },
    "privacyStats": {
      "shareFullAddress": 8,
      "shareModelNumber": 5,
      "totalPrivate": 39
    },
    "permissionRequests": {
      "total": 15,
      "pending": 5,
      "approved": 8,
      "denied": 2
    }
  }
}
```

---

### 8. Export to CSV

Export reports to CSV format with privacy filtering.

**Endpoint:** `GET /api/reports/export/csv`

**Query Parameters:** (same as Query Reports)

**Response:**
CSV file download with headers:
```csv
Report ID,Category,Make,Model,Model Number,Issue,Location,Zip Code,Created Date,Share Address,Share Model Number,Permission Requests
```

---

### 9. Delete Report

Delete a report (owner only).

**Endpoint:** `DELETE /api/reports/:id`

**Response:**
```json
{
  "success": true,
  "message": "Report deleted successfully"
}
```

---

### 10. Health Check

Check API health status.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-28T12:00:00Z"
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

---

## Privacy Model

### Default Privacy Settings
- Full addresses are **hidden** by default
- Model numbers are **hidden** by default

### Data Access Levels
1. **Public Data** (always visible):
   - Category, make, model
   - Issue description
   - Zip code
   - Nearest intersection
   - Approximate location (zip code center)

2. **Private Data** (restricted):
   - Full address
   - Exact coordinates
   - Model number

### Access Rules
Private data is visible when:
- User is the report owner, OR
- User has approved permission, OR
- Owner has set `shareFullAddress` or `shareModelNumber` to `true`

---

## Example Workflows

### Workflow 1: Creating and Sharing a Report

1. Create a report:
```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -H "x-user-id: user123" \
  -d '{
    "category": "Appliance",
    "make": "Samsung",
    "model": "RF28R7351SR",
    "modelNumber": "RF28R7351SR/AA",
    "issue": "Not cooling properly",
    "address": "123 Main St, San Francisco, CA 94102"
  }'
```

2. Update privacy to share address:
```bash
curl -X PATCH http://localhost:3000/api/reports/abc123/privacy \
  -H "Content-Type: application/json" \
  -H "x-user-id: user123" \
  -d '{"shareFullAddress": true}'
```

### Workflow 2: Requesting Access to Private Data

1. Request permission:
```bash
curl -X POST http://localhost:3000/api/reports/abc123/permissions \
  -H "x-user-id: user456"
```

2. Owner approves:
```bash
curl -X PUT http://localhost:3000/api/reports/abc123/permissions/user456 \
  -H "Content-Type: application/json" \
  -H "x-user-id: user123" \
  -d '{"decision": "approved"}'
```

3. Requester can now view private data:
```bash
curl http://localhost:3000/api/reports/abc123 \
  -H "x-user-id: user456"
```

### Workflow 3: Analytics and Export

1. Get analytics:
```bash
curl "http://localhost:3000/api/analytics?category=Appliance&startDate=2026-02-01"
```

2. Export to CSV:
```bash
curl "http://localhost:3000/api/reports/export/csv?category=Appliance" \
  -o reports.csv
```

---

## Rate Limiting

Consider implementing rate limiting for production:
- Geocoding API calls (Google Maps has usage limits)
- Report creation (prevent spam)
- Analytics queries (resource intensive)

## Security Recommendations

1. **Authentication**: Implement proper authentication (JWT, OAuth)
2. **HTTPS**: Use HTTPS in production
3. **Input Validation**: Validate all input data
4. **Rate Limiting**: Implement rate limiting
5. **CORS**: Configure CORS properly for your domains
6. **API Keys**: Store API keys securely (environment variables)
7. **Logging**: Log all privacy-related actions
8. **Audit Trail**: Track who accesses private data
