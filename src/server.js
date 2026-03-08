/**
 * Standalone Express Server for Product CRM Manager
 * Run this outside of CREAO as a traditional Node.js app
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import firebaseService from './services/FirebaseService.js';
import { GeocodingService } from './services/GeocodingService.js';
import { ProductEventController } from './controllers/ProductEventController.js';
import { authenticateUser, optionalAuth } from './middleware/authMiddleware.js';
import configRouter from './routes/config.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || true
    : true,
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from public directory
app.use(express.static(join(__dirname, '../public')));

// Initialize services
let geocodingService;
let productEventController;

// Load Firebase credentials
function loadFirebaseConfig() {
  try {
    // Option 1: Load from service account JSON string (for production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      return {
        serviceAccount,
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
      };
    }

    // Option 2: Load from service account JSON file
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const serviceAccount = JSON.parse(
        readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8')
      );
      return {
        serviceAccount,
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
      };
    }

    // Option 3: Load from individual environment variables
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      return {
        serviceAccount: {
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL
        },
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
      };
    }

    throw new Error('Firebase credentials not found in environment variables');
  } catch (error) {
    console.error('Error loading Firebase config:', error.message);
    console.error('Please set FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_PATH, or provide individual credentials in environment');
    process.exit(1);
  }
}

// Initialize Firebase
try {
  const firebaseConfig = loadFirebaseConfig();
  firebaseService.initialize(firebaseConfig);
  console.log('✓ Firebase initialized successfully');
} catch (error) {
  console.error('✗ Failed to initialize Firebase:', error.message);
  process.exit(1);
}

// Initialize Google Maps
try {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    throw new Error('GOOGLE_MAPS_API_KEY not found in environment variables');
  }
  geocodingService = new GeocodingService(process.env.GOOGLE_MAPS_API_KEY);
  console.log('✓ Google Maps initialized successfully');
} catch (error) {
  console.error('✗ Failed to initialize Google Maps:', error.message);
  process.exit(1);
}

// Initialize controller
productEventController = new ProductEventController(process.env.GOOGLE_MAPS_API_KEY);
console.log('✓ Product Event Controller initialized');

// ============================================================================
// API Routes
// ============================================================================

// Config routes (for Firebase config)
app.use('/api', configRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Product CRM Manager API is running',
    timestamp: new Date().toISOString()
  });
});

// Create a product event report (REQUIRES AUTHENTICATION)
app.post('/api/reports', authenticateUser, async (req, res) => {
  try {
    const { category, make, model, modelNumber, issue, address, shareFullAddress, shareModelNumber } = req.body;

    // Validate required fields
    if (!category || !make || !model || !issue || !address) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['category', 'make', 'model', 'issue', 'address']
      });
    }

    // Use authenticated user ID (from Firebase Auth token)
    const userId = req.user.uid;

    const result = await productEventController.createReport({
      category,
      make,
      model,
      modelNumber,
      issue,
      address,
      shareFullAddress: shareFullAddress || false,
      shareModelNumber: shareModelNumber || false
    }, userId);

    res.status(201).json({
      success: true,
      reportId: result.reportId,
      message: 'Product report created successfully',
      data: result
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      error: 'Failed to create report',
      message: error.message
    });
  }
});

// Get a specific report by ID
app.get('/api/reports/:id', async (req, res) => {
  try {
    const report = await firebaseService.getProductEvent(req.params.id);

    if (!report) {
      return res.status(404).json({
        error: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      error: 'Failed to fetch report',
      message: error.message
    });
  }
});

// Get reports aggregated by ZIP code for privacy-aware map view
app.get('/api/reports/map/zipcode', optionalAuth, async (req, res) => {
  try {
    const requesterId = req.user ? req.user.uid : null;
    const zipCodeData = await productEventController.getReportsByZipCode(requesterId);

    res.json({
      success: true,
      count: zipCodeData.length,
      totalReports: zipCodeData.reduce((sum, zip) => sum + zip.count, 0),
      data: zipCodeData
    });
  } catch (error) {
    console.error('Error fetching ZIP code data:', error);
    res.status(500).json({
      error: 'Failed to fetch ZIP code data',
      message: error.message
    });
  }
});

// Get top worst offenders (brands, models, or serial numbers)
app.get('/api/reports/rankings', optionalAuth, async (req, res) => {
  try {
    const requesterId = req.user ? req.user.uid : null;
    const type = req.query.type || 'brand'; // brand, model, serial
    const limit = parseInt(req.query.limit) || 25;

    const events = await firebaseService.queryProductEvents({});
    const rankings = {};

    events.forEach(event => {
      const publicView = event.getPublicView(requesterId);
      let key;

      if (type === 'brand') {
        key = publicView.make;
      } else if (type === 'model') {
        key = `${publicView.make} ${publicView.model}`;
      } else if (type === 'serial' && publicView.modelNumber) {
        key = publicView.modelNumber;
      }

      if (key) {
        if (!rankings[key]) {
          rankings[key] = {
            name: key,
            count: 0,
            categories: {},
            recentIssues: []
          };
        }
        rankings[key].count++;
        rankings[key].categories[publicView.category] = (rankings[key].categories[publicView.category] || 0) + 1;
        if (rankings[key].recentIssues.length < 3) {
          rankings[key].recentIssues.push(publicView.issue.substring(0, 100));
        }
      }
    });

    const topRankings = Object.values(rankings)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    res.json({
      success: true,
      type: type,
      count: topRankings.length,
      data: topRankings
    });
  } catch (error) {
    console.error('Error fetching rankings:', error);
    res.status(500).json({
      error: 'Failed to fetch rankings',
      message: error.message
    });
  }
});

// Get user's ZIP code from IP address
app.get('/api/location/ip', async (req, res) => {
  try {
    // Get client IP
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

    // For local development, return default location
    if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp?.includes('::ffff:127')) {
      return res.json({
        success: true,
        zipCode: '94102',
        city: 'San Francisco',
        state: 'CA',
        location: { lat: 37.7749, lng: -122.4194 },
        source: 'default'
      });
    }

    // For production, you would use a geolocation service like ipapi.co
    // const response = await axios.get(`https://ipapi.co/${clientIp}/json/`);
    // For now, return default
    res.json({
      success: true,
      zipCode: '94102',
      city: 'San Francisco',
      state: 'CA',
      location: { lat: 37.7749, lng: -122.4194 },
      source: 'default'
    });
  } catch (error) {
    console.error('Error getting location from IP:', error);
    res.status(500).json({
      error: 'Failed to get location',
      message: error.message
    });
  }
});

// Get time series data for complaint trends
app.get('/api/reports/timeseries', optionalAuth, async (req, res) => {
  try {
    const requesterId = req.user ? req.user.uid : null;
    const brand = req.query.brand;
    const model = req.query.model;
    const range = req.query.range || '1Y'; // 1M, 3M, 6M, 1Y, 5Y

    const events = await firebaseService.queryProductEvents({});

    // Calculate date range
    const now = new Date();
    const rangeMap = {
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365,
      '5Y': 365 * 5
    };
    const daysBack = rangeMap[range] || 365;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Group by date
    const timeSeriesData = {};

    events.forEach(event => {
      const publicView = event.getPublicView(requesterId);
      const createdAt = new Date(publicView.createdAt);

      if (createdAt < startDate) return;

      // Filter by brand/model if provided
      if (brand && publicView.make !== brand) return;
      if (model && `${publicView.make} ${publicView.model}` !== model) return;

      const dateKey = createdAt.toISOString().split('T')[0]; // YYYY-MM-DD

      if (!timeSeriesData[dateKey]) {
        timeSeriesData[dateKey] = {
          date: dateKey,
          count: 0,
          categories: {}
        };
      }

      timeSeriesData[dateKey].count++;
      timeSeriesData[dateKey].categories[publicView.category] =
        (timeSeriesData[dateKey].categories[publicView.category] || 0) + 1;
    });

    // Convert to array and sort by date
    const sortedData = Object.values(timeSeriesData)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Fill in missing dates with 0 counts for smooth chart
    const filledData = [];
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      const existing = sortedData.find(item => item.date === dateKey);
      filledData.push(existing || { date: dateKey, count: 0, categories: {} });
    }

    res.json({
      success: true,
      range: range,
      data: filledData
    });
  } catch (error) {
    console.error('Error fetching time series:', error);
    res.status(500).json({
      error: 'Failed to fetch time series',
      message: error.message
    });
  }
});

// Get all reports for map view (optional authentication) - DEPRECATED, use /zipcode instead
app.get('/api/reports/map/all', optionalAuth, async (req, res) => {
  try {
    const requesterId = req.user ? req.user.uid : null;
    const reports = await productEventController.getAllReportsForMap(requesterId);

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('Error fetching reports for map:', error);
    res.status(500).json({
      error: 'Failed to fetch reports',
      message: error.message
    });
  }
});

// Query reports with filters
app.get('/api/reports', async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      make: req.query.make,
      model: req.query.model,
      zipCode: req.query.zipCode,
      createdBy: req.query.userId,
      limit: req.query.limit ? parseInt(req.query.limit) : 50
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) delete filters[key];
    });

    const reports = await firebaseService.queryProductEvents(filters);

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('Error querying reports:', error);
    res.status(500).json({
      error: 'Failed to query reports',
      message: error.message
    });
  }
});

// Update a report
app.patch('/api/reports/:id', async (req, res) => {
  try {
    const { shareFullAddress, shareModelNumber, ...otherUpdates } = req.body;

    const updates = {};
    if (shareFullAddress !== undefined) updates.shareFullAddress = shareFullAddress;
    if (shareModelNumber !== undefined) updates.shareModelNumber = shareModelNumber;

    // Add other allowed updates here
    // Be careful not to allow updates to protected fields

    await firebaseService.updateProductEvent(req.params.id, updates);

    res.json({
      success: true,
      message: 'Report updated successfully',
      reportId: req.params.id
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({
      error: 'Failed to update report',
      message: error.message
    });
  }
});

// Delete a report
app.delete('/api/reports/:id', async (req, res) => {
  try {
    await firebaseService.deleteProductEvent(req.params.id);

    res.json({
      success: true,
      message: 'Report deleted successfully',
      reportId: req.params.id
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      error: 'Failed to delete report',
      message: error.message
    });
  }
});

// Get analytics
app.get('/api/analytics', async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      zipCode: req.query.zipCode,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) delete filters[key];
    });

    const analytics = await firebaseService.getAnalytics(filters);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: error.message
    });
  }
});

// Test geocoding
app.post('/api/geocode', async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        error: 'Address is required'
      });
    }

    const result = await geocodingService.geocodeAddress(address);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error geocoding address:', error);
    res.status(500).json({
      error: 'Failed to geocode address',
      message: error.message
    });
  }
});

// Get user's location from IP address
app.get('/api/location/ip', async (req, res) => {
  try {
    // Get client IP address
    const ip = req.headers['x-forwarded-for']?.split(',')[0] ||
               req.connection.remoteAddress ||
               req.socket.remoteAddress;

    // For localhost/development, return San Francisco as default
    if (ip === '127.0.0.1' || ip === '::1' || ip?.includes('127.0.0.1')) {
      return res.json({
        success: true,
        location: {
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          lat: 37.7749,
          lng: -122.4194,
          country: 'US'
        },
        ip: 'localhost',
        isDevelopment: true
      });
    }

    // In production, use ipapi.co or similar service
    // For now, return default US location
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();

    if (data && data.latitude && data.longitude) {
      return res.json({
        success: true,
        location: {
          city: data.city,
          state: data.region_code,
          zipCode: data.postal,
          lat: data.latitude,
          lng: data.longitude,
          country: data.country_code
        },
        ip: ip
      });
    } else {
      // Fallback to center of US
      return res.json({
        success: true,
        location: {
          city: 'United States',
          state: '',
          zipCode: '',
          lat: 37.0902,
          lng: -95.7129,
          country: 'US'
        },
        ip: ip,
        isFallback: true
      });
    }
  } catch (error) {
    console.error('Error getting IP location:', error);
    // Return US center as fallback
    res.json({
      success: true,
      location: {
        city: 'United States',
        state: '',
        zipCode: '',
        lat: 37.0902,
        lng: -95.7129,
        country: 'US'
      },
      error: error.message,
      isFallback: true
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('='.repeat(60));
  console.log('🚀 Product CRM Manager API Server');
  console.log('='.repeat(60));
  console.log(`Server running on: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  GET    /health                    - Health check`);
  console.log(`  POST   /api/reports               - Create a report`);
  console.log(`  GET    /api/reports               - Query reports`);
  console.log(`  GET    /api/reports/:id           - Get specific report`);
  console.log(`  PATCH  /api/reports/:id           - Update a report`);
  console.log(`  DELETE /api/reports/:id           - Delete a report`);
  console.log(`  GET    /api/analytics             - Get analytics`);
  console.log(`  POST   /api/geocode               - Test geocoding`);
  console.log('='.repeat(60));
  console.log('');
});

export default app;
