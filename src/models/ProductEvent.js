/**
 * ProductEvent Model
 * Represents a product issue report with privacy-aware data handling
 */

export class ProductEvent {
  constructor(data) {
    // Product Information
    this.category = data.category;
    this.make = data.make;
    this.model = data.model;
    this.modelNumber = data.modelNumber; // PRIVATE by default

    // Issue Details
    this.issue = data.issue;
    this.rating = data.rating || 1; // 1-5 star rating (1 = worst, 5 = best)

    // Location Data
    this.address = data.address; // PRIVATE - full address
    this.zipCode = data.zipCode; // PUBLIC - extracted from address
    this.nearestIntersection = data.nearestIntersection; // PUBLIC

    // Coordinates
    this.location = data.location; // PRIVATE - exact coordinates
    this.displayLocation = data.displayLocation; // PUBLIC - zip code center

    // Privacy Controls
    this.shareFullAddress = data.shareFullAddress ?? false; // Default: false
    this.shareModelNumber = data.shareModelNumber ?? false; // Default: false

    // Metadata
    this.createdBy = data.createdBy; // User ID
    this.createdAt = data.createdAt || new Date();
    this.permissionRequests = data.permissionRequests || [];
  }

  /**
   * Get public view of the event (respects privacy settings)
   * @param {string} requesterId - ID of user requesting the data
   * @returns {Object} Public data object
   */
  getPublicView(requesterId) {
    const isOwner = requesterId === this.createdBy;
    const hasPermission = this.hasApprovedPermission(requesterId);
    const canViewPrivate = isOwner || hasPermission;

    return {
      category: this.category,
      make: this.make,
      model: this.model,
      modelNumber: (this.shareModelNumber || canViewPrivate) ? this.modelNumber : '[PRIVATE]',
      issue: this.issue,
      rating: this.rating,
      address: (this.shareFullAddress || canViewPrivate) ? this.address : '[PRIVATE]',
      zipCode: this.zipCode,
      nearestIntersection: this.nearestIntersection,
      location: canViewPrivate ? this.location : this.displayLocation,
      createdAt: this.createdAt,
      permissionRequests: this.permissionRequests.length
    };
  }

  /**
   * Check if a user has approved permission to view private data
   * @param {string} userId - User ID to check
   * @returns {boolean}
   */
  hasApprovedPermission(userId) {
    return this.permissionRequests.some(
      req => req.requesterId === userId && req.status === 'approved'
    );
  }

  /**
   * Request permission to view private data
   * @param {string} requesterId - User requesting access
   * @returns {Object} Updated permission request
   */
  requestPermission(requesterId) {
    const existing = this.permissionRequests.find(
      req => req.requesterId === requesterId
    );

    if (existing) {
      return { success: false, message: 'Permission already requested', status: existing.status };
    }

    const newRequest = {
      requesterId,
      status: 'pending',
      requestedAt: new Date()
    };

    this.permissionRequests.push(newRequest);
    return { success: true, message: 'Permission request created', request: newRequest };
  }

  /**
   * Approve or deny a permission request
   * @param {string} requesterId - User whose request to update
   * @param {string} decision - 'approved' or 'denied'
   * @returns {Object} Result of the decision
   */
  handlePermissionRequest(requesterId, decision) {
    const request = this.permissionRequests.find(
      req => req.requesterId === requesterId
    );

    if (!request) {
      return { success: false, message: 'Permission request not found' };
    }

    request.status = decision;
    request.decidedAt = new Date();

    return { success: true, message: `Permission ${decision}`, request };
  }

  /**
   * Convert to Firestore document format
   * @returns {Object} Firestore-compatible object
   */
  toFirestore() {
    return {
      category: this.category,
      make: this.make,
      model: this.model,
      modelNumber: this.modelNumber,
      issue: this.issue,
      rating: this.rating,
      address: this.address,
      zipCode: this.zipCode,
      nearestIntersection: this.nearestIntersection,
      location: this.location,
      displayLocation: this.displayLocation,
      shareFullAddress: this.shareFullAddress,
      shareModelNumber: this.shareModelNumber,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      permissionRequests: this.permissionRequests
    };
  }

  /**
   * Create ProductEvent from Firestore document
   * @param {Object} doc - Firestore document data
   * @returns {ProductEvent}
   */
  static fromFirestore(doc) {
    return new ProductEvent(doc);
  }
}
