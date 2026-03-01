/**
 * ProductEvent Model Tests
 */

import { ProductEvent } from '../src/models/ProductEvent.js';

describe('ProductEvent', () => {
  const sampleData = {
    category: 'Appliance',
    make: 'Samsung',
    model: 'RF28R7351SR',
    modelNumber: 'RF28R7351SR/AA',
    issue: 'Refrigerator stopped cooling',
    address: '123 Main St, San Francisco, CA 94102',
    zipCode: '94102',
    nearestIntersection: 'Main St & 1st Ave',
    location: { lat: 37.7749, lng: -122.4194 },
    displayLocation: { lat: 37.7750, lng: -122.4195 },
    createdBy: 'user123'
  };

  describe('constructor', () => {
    test('should create ProductEvent with default privacy settings', () => {
      const event = new ProductEvent(sampleData);

      expect(event.category).toBe('Appliance');
      expect(event.make).toBe('Samsung');
      expect(event.shareFullAddress).toBe(false);
      expect(event.shareModelNumber).toBe(false);
      expect(event.permissionRequests).toEqual([]);
    });

    test('should respect custom privacy settings', () => {
      const data = { ...sampleData, shareFullAddress: true, shareModelNumber: true };
      const event = new ProductEvent(data);

      expect(event.shareFullAddress).toBe(true);
      expect(event.shareModelNumber).toBe(true);
    });
  });

  describe('getPublicView', () => {
    test('should hide private data for non-owners without permission', () => {
      const event = new ProductEvent(sampleData);
      const publicView = event.getPublicView('different-user');

      expect(publicView.modelNumber).toBe('[PRIVATE]');
      expect(publicView.address).toBe('[PRIVATE]');
      expect(publicView.location).toEqual(event.displayLocation);
    });

    test('should show all data to owner', () => {
      const event = new ProductEvent(sampleData);
      const publicView = event.getPublicView('user123');

      expect(publicView.modelNumber).toBe('RF28R7351SR/AA');
      expect(publicView.address).toBe('123 Main St, San Francisco, CA 94102');
      expect(publicView.location).toEqual(event.location);
    });

    test('should respect shareFullAddress setting', () => {
      const data = { ...sampleData, shareFullAddress: true };
      const event = new ProductEvent(data);
      const publicView = event.getPublicView('different-user');

      expect(publicView.address).toBe('123 Main St, San Francisco, CA 94102');
    });

    test('should respect shareModelNumber setting', () => {
      const data = { ...sampleData, shareModelNumber: true };
      const event = new ProductEvent(data);
      const publicView = event.getPublicView('different-user');

      expect(publicView.modelNumber).toBe('RF28R7351SR/AA');
    });
  });

  describe('permission management', () => {
    test('should allow permission request', () => {
      const event = new ProductEvent(sampleData);
      const result = event.requestPermission('user456');

      expect(result.success).toBe(true);
      expect(event.permissionRequests).toHaveLength(1);
      expect(event.permissionRequests[0].requesterId).toBe('user456');
      expect(event.permissionRequests[0].status).toBe('pending');
    });

    test('should prevent duplicate permission requests', () => {
      const event = new ProductEvent(sampleData);
      event.requestPermission('user456');
      const result = event.requestPermission('user456');

      expect(result.success).toBe(false);
      expect(event.permissionRequests).toHaveLength(1);
    });

    test('should approve permission request', () => {
      const event = new ProductEvent(sampleData);
      event.requestPermission('user456');
      const result = event.handlePermissionRequest('user456', 'approved');

      expect(result.success).toBe(true);
      expect(event.permissionRequests[0].status).toBe('approved');
    });

    test('should show private data to approved users', () => {
      const event = new ProductEvent(sampleData);
      event.requestPermission('user456');
      event.handlePermissionRequest('user456', 'approved');

      const publicView = event.getPublicView('user456');
      expect(publicView.modelNumber).toBe('RF28R7351SR/AA');
      expect(publicView.address).toBe('123 Main St, San Francisco, CA 94102');
    });
  });

  describe('hasApprovedPermission', () => {
    test('should return true for approved permission', () => {
      const event = new ProductEvent(sampleData);
      event.requestPermission('user456');
      event.handlePermissionRequest('user456', 'approved');

      expect(event.hasApprovedPermission('user456')).toBe(true);
    });

    test('should return false for pending permission', () => {
      const event = new ProductEvent(sampleData);
      event.requestPermission('user456');

      expect(event.hasApprovedPermission('user456')).toBe(false);
    });

    test('should return false for denied permission', () => {
      const event = new ProductEvent(sampleData);
      event.requestPermission('user456');
      event.handlePermissionRequest('user456', 'denied');

      expect(event.hasApprovedPermission('user456')).toBe(false);
    });
  });

  describe('Firestore conversion', () => {
    test('should convert to Firestore format', () => {
      const event = new ProductEvent(sampleData);
      const firestoreData = event.toFirestore();

      expect(firestoreData).toHaveProperty('category');
      expect(firestoreData).toHaveProperty('make');
      expect(firestoreData).toHaveProperty('model');
      expect(firestoreData.shareFullAddress).toBe(false);
      expect(firestoreData.shareModelNumber).toBe(false);
    });

    test('should create from Firestore format', () => {
      const firestoreData = {
        id: 'doc123',
        ...sampleData
      };
      const event = ProductEvent.fromFirestore(firestoreData);

      expect(event).toBeInstanceOf(ProductEvent);
      expect(event.category).toBe('Appliance');
      expect(event.make).toBe('Samsung');
    });
  });
});
