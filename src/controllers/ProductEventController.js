/**
 * Product Event Controller
 * Handles business logic for product event operations
 */

import { ProductEvent } from '../models/ProductEvent.js';
import firebaseService from '../services/FirebaseService.js';
import { GeocodingService } from '../services/GeocodingService.js';
import { ExportService } from '../utils/ExportService.js';

export class ProductEventController {
  constructor(geocodingApiKey) {
    this.geocodingService = new GeocodingService(geocodingApiKey);
    this.exportService = new ExportService();
  }

  /**
   * Create a new product event report
   * @param {Object} data - Report data
   * @param {string} userId - User creating the report
   * @returns {Promise<Object>} Created report details
   */
  async createReport(data, userId) {
    try {
      // Validate required fields
      this.validateReportData(data);

      // Geocode the address
      const locationData = await this.geocodingService.geocodeAddress(data.address);

      // Create ProductEvent instance
      const productEvent = new ProductEvent({
        category: data.category,
        make: data.make,
        model: data.model,
        modelNumber: data.modelNumber,
        issue: data.issue,
        address: data.address,
        zipCode: locationData.zipCode,
        nearestIntersection: locationData.nearestIntersection,
        location: locationData.exactLocation,
        displayLocation: locationData.displayLocation,
        shareFullAddress: data.shareFullAddress ?? false,
        shareModelNumber: data.shareModelNumber ?? false,
        createdBy: userId
      });

      // Save to Firestore
      const reportId = await firebaseService.createProductEvent(productEvent);

      return {
        success: true,
        reportId,
        message: 'Report created successfully',
        details: {
          category: productEvent.category,
          make: productEvent.make,
          model: productEvent.model,
          zipCode: productEvent.zipCode,
          nearestIntersection: productEvent.nearestIntersection,
          privacySettings: {
            shareFullAddress: productEvent.shareFullAddress,
            shareModelNumber: productEvent.shareModelNumber
          }
        }
      };
    } catch (error) {
      throw new Error(`Failed to create report: ${error.message}`);
    }
  }

  /**
   * Get a product event by ID
   * @param {string} reportId - Report ID
   * @param {string} requesterId - User requesting the report
   * @returns {Promise<Object>} Report data
   */
  async getReport(reportId, requesterId) {
    const event = await firebaseService.getProductEvent(reportId);

    if (!event) {
      throw new Error('Report not found');
    }

    return event.getPublicView(requesterId);
  }

  /**
   * Query product events with filters
   * @param {Object} filters - Query filters
   * @param {string} requesterId - User making the request
   * @returns {Promise<Array>} List of reports
   */
  async queryReports(filters, requesterId) {
    const events = await firebaseService.queryProductEvents(filters);

    return events.map(event => ({
      id: event.id,
      ...event.getPublicView(requesterId)
    }));
  }

  /**
   * Get all reports for map view
   * @param {string} requesterId - User making the request (optional)
   * @returns {Promise<Array>} List of reports with location data for map markers
   */
  async getAllReportsForMap(requesterId = null) {
    const events = await firebaseService.queryProductEvents({});

    return events.map(event => {
      const publicView = event.getPublicView(requesterId);
      return {
        id: event.id,
        category: publicView.category,
        make: publicView.make,
        model: publicView.model,
        issue: publicView.issue,
        location: publicView.location, // { lat, lng }
        displayLocation: publicView.displayLocation,
        zipCode: publicView.zipCode,
        nearestIntersection: publicView.nearestIntersection,
        createdAt: publicView.createdAt,
        // Only include if user has permission
        address: publicView.address,
        modelNumber: publicView.modelNumber
      };
    });
  }

  /**
   * Get reports aggregated by ZIP code for privacy-aware map view
   * @param {string} requesterId - User making the request (optional)
   * @returns {Promise<Array>} List of ZIP codes with aggregated report data
   */
  async getReportsByZipCode(requesterId = null) {
    const events = await firebaseService.queryProductEvents({});

    // Group reports by ZIP code
    const zipCodeMap = new Map();

    events.forEach(event => {
      const publicView = event.getPublicView(requesterId);
      const zipCode = publicView.zipCode;

      if (!zipCode) return; // Skip reports without ZIP code

      if (!zipCodeMap.has(zipCode)) {
        zipCodeMap.set(zipCode, {
          zipCode: zipCode,
          count: 0,
          reports: [],
          categories: {},
          makes: {},
          // Use first report's location as ZIP code center approximation
          location: publicView.location
        });
      }

      const zipData = zipCodeMap.get(zipCode);
      zipData.count++;

      // Store report summary (without exact location)
      zipData.reports.push({
        id: event.id,
        category: publicView.category,
        make: publicView.make,
        model: publicView.model,
        issue: publicView.issue,
        nearestIntersection: publicView.nearestIntersection,
        createdAt: publicView.createdAt,
        modelNumber: publicView.modelNumber
      });

      // Count by category
      zipData.categories[publicView.category] = (zipData.categories[publicView.category] || 0) + 1;

      // Count by make
      zipData.makes[publicView.make] = (zipData.makes[publicView.make] || 0) + 1;
    });

    // Convert map to array and sort by count
    return Array.from(zipCodeMap.values())
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Request permission to view private data
   * @param {string} reportId - Report ID
   * @param {string} requesterId - User requesting permission
   * @returns {Promise<Object>} Request result
   */
  async requestPermission(reportId, requesterId) {
    const event = await firebaseService.getProductEvent(reportId);

    if (!event) {
      throw new Error('Report not found');
    }

    if (event.createdBy === requesterId) {
      return { success: false, message: 'You own this report and already have full access' };
    }

    const result = event.requestPermission(requesterId);

    if (result.success) {
      await firebaseService.updateProductEvent(reportId, {
        permissionRequests: event.permissionRequests
      });
    }

    return result;
  }

  /**
   * Approve or deny a permission request
   * @param {string} reportId - Report ID
   * @param {string} requesterId - User whose request to handle
   * @param {string} decision - 'approved' or 'denied'
   * @param {string} ownerId - Report owner making the decision
   * @returns {Promise<Object>} Decision result
   */
  async handlePermissionRequest(reportId, requesterId, decision, ownerId) {
    const event = await firebaseService.getProductEvent(reportId);

    if (!event) {
      throw new Error('Report not found');
    }

    if (event.createdBy !== ownerId) {
      throw new Error('Only the report owner can approve or deny permission requests');
    }

    const result = event.handlePermissionRequest(requesterId, decision);

    if (result.success) {
      await firebaseService.updateProductEvent(reportId, {
        permissionRequests: event.permissionRequests
      });
    }

    return result;
  }

  /**
   * Update privacy settings for a report
   * @param {string} reportId - Report ID
   * @param {Object} settings - Privacy settings
   * @param {string} userId - User making the update
   * @returns {Promise<Object>} Update result
   */
  async updatePrivacySettings(reportId, settings, userId) {
    const event = await firebaseService.getProductEvent(reportId);

    if (!event) {
      throw new Error('Report not found');
    }

    if (event.createdBy !== userId) {
      throw new Error('Only the report owner can update privacy settings');
    }

    const updates = {};
    if (settings.shareFullAddress !== undefined) {
      updates.shareFullAddress = settings.shareFullAddress;
    }
    if (settings.shareModelNumber !== undefined) {
      updates.shareModelNumber = settings.shareModelNumber;
    }

    await firebaseService.updateProductEvent(reportId, updates);

    return {
      success: true,
      message: 'Privacy settings updated',
      settings: updates
    };
  }

  /**
   * Generate analytics report
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>} Analytics data
   */
  async generateAnalytics(filters = {}) {
    return await firebaseService.getAnalytics(filters);
  }

  /**
   * Export reports to CSV
   * @param {Object} filters - Query filters
   * @param {string} requesterId - User requesting the export
   * @returns {Promise<string>} CSV content
   */
  async exportToCSV(filters, requesterId) {
    const events = await firebaseService.queryProductEvents(filters);
    const publicViews = events.map(event => ({
      id: event.id,
      ...event.getPublicView(requesterId)
    }));

    return this.exportService.generateCSV(publicViews);
  }

  /**
   * Validate report data
   * @param {Object} data - Report data to validate
   * @throws {Error} If validation fails
   */
  validateReportData(data) {
    const required = ['category', 'make', 'model', 'issue', 'address'];

    for (const field of required) {
      if (!data[field] || data[field].trim() === '') {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }

  /**
   * Delete a report
   * @param {string} reportId - Report ID
   * @param {string} userId - User requesting deletion
   * @returns {Promise<Object>} Deletion result
   */
  async deleteReport(reportId, userId) {
    const event = await firebaseService.getProductEvent(reportId);

    if (!event) {
      throw new Error('Report not found');
    }

    if (event.createdBy !== userId) {
      throw new Error('Only the report owner can delete the report');
    }

    await firebaseService.deleteProductEvent(reportId);

    return {
      success: true,
      message: 'Report deleted successfully'
    };
  }
}
