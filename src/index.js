/**
 * Product CRM Manager
 * Main application entry point
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import firebaseService from './services/FirebaseService.js';
import { ProductEventController } from './controllers/ProductEventController.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase
const firebaseConfig = {
  serviceAccount: JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}'),
  databaseURL: process.env.FIREBASE_DATABASE_URL
};
firebaseService.initialize(firebaseConfig);

// Initialize controller
const controller = new ProductEventController(process.env.GOOGLE_MAPS_API_KEY);

// Routes

/**
 * Create a new product event report
 * POST /api/reports
 */
app.post('/api/reports', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const result = await controller.createReport(req.body, userId);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get a specific report
 * GET /api/reports/:id
 */
app.get('/api/reports/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const report = await controller.getReport(req.params.id, userId);
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});

/**
 * Query reports with filters
 * GET /api/reports
 */
app.get('/api/reports', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const filters = {
      category: req.query.category,
      make: req.query.make,
      model: req.query.model,
      zipCode: req.query.zipCode,
      createdBy: req.query.createdBy,
      startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined
    };

    // Remove undefined values
    Object.keys(filters).forEach(key =>
      filters[key] === undefined && delete filters[key]
    );

    const reports = await controller.queryReports(filters, userId);
    res.json({ success: true, data: reports, count: reports.length });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Request permission to view private data
 * POST /api/reports/:id/permissions
 */
app.post('/api/reports/:id/permissions', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const result = await controller.requestPermission(req.params.id, userId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Approve or deny permission request
 * PUT /api/reports/:id/permissions/:requesterId
 */
app.put('/api/reports/:id/permissions/:requesterId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const { decision } = req.body; // 'approved' or 'denied'

    const result = await controller.handlePermissionRequest(
      req.params.id,
      req.params.requesterId,
      decision,
      userId
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Update privacy settings
 * PATCH /api/reports/:id/privacy
 */
app.patch('/api/reports/:id/privacy', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const result = await controller.updatePrivacySettings(
      req.params.id,
      req.body,
      userId
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get analytics
 * GET /api/analytics
 */
app.get('/api/analytics', async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      make: req.query.make,
      zipCode: req.query.zipCode,
      startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate) : undefined
    };

    Object.keys(filters).forEach(key =>
      filters[key] === undefined && delete filters[key]
    );

    const analytics = await controller.generateAnalytics(filters);
    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Export reports to CSV
 * GET /api/reports/export/csv
 */
app.get('/api/reports/export/csv', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const filters = {
      category: req.query.category,
      make: req.query.make,
      model: req.query.model,
      zipCode: req.query.zipCode,
      startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate) : undefined
    };

    Object.keys(filters).forEach(key =>
      filters[key] === undefined && delete filters[key]
    );

    const csv = await controller.exportToCSV(filters, userId);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=product-reports.csv');
    res.send(csv);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Delete a report
 * DELETE /api/reports/:id
 */
app.delete('/api/reports/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const result = await controller.deleteReport(req.params.id, userId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Product CRM Manager API',
    version: '1.0.0',
    description: 'Privacy-aware product issue tracking and CRM management',
    endpoints: {
      'POST /api/reports': 'Create a new report',
      'GET /api/reports': 'Query reports with filters',
      'GET /api/reports/:id': 'Get a specific report',
      'POST /api/reports/:id/permissions': 'Request permission to view private data',
      'PUT /api/reports/:id/permissions/:requesterId': 'Approve/deny permission request',
      'PATCH /api/reports/:id/privacy': 'Update privacy settings',
      'GET /api/analytics': 'Get analytics data',
      'GET /api/reports/export/csv': 'Export reports to CSV',
      'DELETE /api/reports/:id': 'Delete a report'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Product CRM Manager API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
