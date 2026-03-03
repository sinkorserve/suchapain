/**
 * Firebase config endpoint
 * Returns public Firebase configuration (safe to expose)
 */

import express from 'express';
const router = express.Router();

router.get('/firebase-config', (req, res) => {
    // These Firebase client config values are SAFE to expose publicly
    // They're meant to be in frontend code
    const config = {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
    };

    res.json(config);
});

export default router;
