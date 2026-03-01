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

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
let geocodingService;
let productEventController;

// Load Firebase credentials
function loadFirebaseConfig() {
  try {
    // Option 1: Load from service account JSON file
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const serviceAccount = JSON.parse(
        readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8')
      );
      return {
        serviceAccount,
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
      };
    }

    // Option 2: Load from environment variables
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
    console.error('Please set FIREBASE_SERVICE_ACCOUNT_PATH or provide credentials in .env file');
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
productEventController = new ProductEventController(firebaseService, geocodingService);
console.log('✓ Product Event Controller initialized');

// ============================================================================
// API Routes
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Product CRM Manager API is running',
    timestamp: new Date().toISOString()
  });
});

// Create a product event report
app.post('/api/reports', async (req, res) => {
  try {
    const { category, make, model, modelNumber, issue, address, userId, shareFullAddress, shareModelNumber } = req.body;

    // Validate required fields
    if (!category || !make || !model || !issue || !address) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['category', 'make', 'model', 'issue', 'address']
      });
    }

    const result = await productEventController.createProductEvent({
      category,
      make,
      model,
      modelNumber,
      issue,
      address,
      userId: userId || process.env.DEFAULT_USER_ID || 'anonymous',
      shareFullAddress: shareFullAddress || false,
      shareModelNumber: shareModelNumber || false
    });

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
