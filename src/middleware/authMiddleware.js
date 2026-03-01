/**
 * Authentication Middleware
 * Verifies Firebase Auth tokens and extracts user information
 */

import admin from 'firebase-admin';

/**
 * Middleware to verify Firebase ID token
 * Expects Authorization header: Bearer <token>
 */
export async function authenticateUser(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authentication token provided. Please sign in.'
      });
    }

    const idToken = authHeader.split('Bearer ')[1];

    // Verify the token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Add user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      phoneNumber: decodedToken.phone_number,
      emailVerified: decodedToken.email_verified
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Your session has expired. Please sign in again.'
      });
    }

    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid authentication token. Please sign in.'
    });
  }
}

/**
 * Optional auth - allows both authenticated and unauthenticated requests
 * Sets req.user if token is valid, otherwise continues without user
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        phoneNumber: decodedToken.phone_number,
        emailVerified: decodedToken.email_verified
      };
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
}

export default { authenticateUser, optionalAuth };
