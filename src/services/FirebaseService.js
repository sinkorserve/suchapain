/**
 * Firebase Service
 * Handles all Firestore database operations for product events
 */

import admin from 'firebase-admin';
import { ProductEvent } from '../models/ProductEvent.js';

export class FirebaseService {
  constructor() {
    this.db = null;
    this.collectionName = 'product_events';
  }

  /**
   * Initialize Firebase Admin SDK
   * @param {Object} config - Firebase configuration
   */
  initialize(config) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(config.serviceAccount),
        databaseURL: config.databaseURL
      });
    }
    this.db = admin.firestore();
  }

  /**
   * Create a new product event report
   * @param {ProductEvent} productEvent - Product event to create
   * @returns {Promise<string>} Document ID
   */
  async createProductEvent(productEvent) {
    const docRef = await this.db.collection(this.collectionName).add(
      productEvent.toFirestore()
    );
    return docRef.id;
  }

  /**
   * Get a product event by ID
   * @param {string} eventId - Event document ID
   * @returns {Promise<ProductEvent|null>}
   */
  async getProductEvent(eventId) {
    const doc = await this.db.collection(this.collectionName).doc(eventId).get();

    if (!doc.exists) {
      return null;
    }

    return ProductEvent.fromFirestore({ id: doc.id, ...doc.data() });
  }

  /**
   * Update a product event
   * @param {string} eventId - Event document ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<void>}
   */
  async updateProductEvent(eventId, updates) {
    await this.db.collection(this.collectionName).doc(eventId).update(updates);
  }

  /**
   * Query product events with filters
   * @param {Object} filters - Query filters
   * @returns {Promise<Array<ProductEvent>>}
   */
  async queryProductEvents(filters = {}) {
    let query = this.db.collection(this.collectionName);

    // Apply filters
    if (filters.category) {
      query = query.where('category', '==', filters.category);
    }
    if (filters.make) {
      query = query.where('make', '==', filters.make);
    }
    if (filters.model) {
      query = query.where('model', '==', filters.model);
    }
    if (filters.zipCode) {
      query = query.where('zipCode', '==', filters.zipCode);
    }
    if (filters.createdBy) {
      query = query.where('createdBy', '==', filters.createdBy);
    }

    // Date range filters
    if (filters.startDate) {
      query = query.where('createdAt', '>=', filters.startDate);
    }
    if (filters.endDate) {
      query = query.where('createdAt', '<=', filters.endDate);
    }

    // Order by created date
    query = query.orderBy('createdAt', 'desc');

    // Limit results
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc =>
      ProductEvent.fromFirestore({ id: doc.id, ...doc.data() })
    );
  }

  /**
   * Get analytics data
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>} Analytics data
   */
  async getAnalytics(filters = {}) {
    const events = await this.queryProductEvents(filters);

    const analytics = {
      totalReports: events.length,
      byCategory: {},
      byMake: {},
      byZipCode: {},
      privacyStats: {
        shareFullAddress: 0,
        shareModelNumber: 0,
        totalPrivate: 0
      },
      permissionRequests: {
        total: 0,
        pending: 0,
        approved: 0,
        denied: 0
      }
    };

    events.forEach(event => {
      // Category breakdown
      analytics.byCategory[event.category] = (analytics.byCategory[event.category] || 0) + 1;

      // Make breakdown
      analytics.byMake[event.make] = (analytics.byMake[event.make] || 0) + 1;

      // Zip code breakdown
      analytics.byZipCode[event.zipCode] = (analytics.byZipCode[event.zipCode] || 0) + 1;

      // Privacy stats
      if (event.shareFullAddress) analytics.privacyStats.shareFullAddress++;
      if (event.shareModelNumber) analytics.privacyStats.shareModelNumber++;
      if (!event.shareFullAddress || !event.shareModelNumber) {
        analytics.privacyStats.totalPrivate++;
      }

      // Permission requests
      event.permissionRequests.forEach(req => {
        analytics.permissionRequests.total++;
        analytics.permissionRequests[req.status]++;
      });
    });

    return analytics;
  }

  /**
   * Delete a product event
   * @param {string} eventId - Event document ID
   * @returns {Promise<void>}
   */
  async deleteProductEvent(eventId) {
    await this.db.collection(this.collectionName).doc(eventId).delete();
  }
}

export default new FirebaseService();
