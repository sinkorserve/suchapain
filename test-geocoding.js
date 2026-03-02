/**
 * Test script to debug Google Maps Geocoding API
 * Run with: node test-geocoding.js
 */

import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

console.log('='.repeat(60));
console.log('Google Maps Geocoding API Test');
console.log('='.repeat(60));
console.log('');

// Check if API key exists
console.log('1. Checking API Key...');
if (!API_KEY) {
    console.error('❌ GOOGLE_MAPS_API_KEY not found in .env file');
    process.exit(1);
}
console.log(`✓ API Key found: ${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 4)}`);
console.log('');

// Test the geocoding request
console.log('2. Testing Geocoding Request...');
console.log('   Address: 123 Main Street, San Francisco, CA 94102');
console.log('');

const testAddress = '123 Main Street, San Francisco, CA 94102';
const url = 'https://maps.googleapis.com/maps/api/geocode/json';

async function testGeocoding() {
    try {
        const response = await axios.get(url, {
            params: {
                address: testAddress,
                key: API_KEY
            }
        });

        console.log('Response Status Code:', response.status);
        console.log('Google API Status:', response.data.status);
        console.log('');

        if (response.data.status === 'REQUEST_DENIED') {
            console.error('❌ REQUEST_DENIED Error');
            console.log('');
            console.log('Error Details:');
            console.log('  Message:', response.data.error_message || 'No error message provided');
            console.log('');
            console.log('Common Causes:');
            console.log('  1. Billing not enabled on Google Cloud project');
            console.log('  2. Geocoding API not enabled');
            console.log('  3. API key restrictions blocking the request');
            console.log('  4. API key doesn\'t have permission for Geocoding API');
            console.log('');
            console.log('Steps to Fix:');
            console.log('  1. Go to: https://console.cloud.google.com/billing');
            console.log('     → Ensure billing is linked to your project');
            console.log('');
            console.log('  2. Go to: https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com');
            console.log('     → Click "Enable" if not already enabled');
            console.log('');
            console.log('  3. Go to: https://console.cloud.google.com/apis/credentials');
            console.log('     → Click on your API key');
            console.log('     → Check "Application restrictions" = None');
            console.log('     → Check "API restrictions" includes Geocoding API');
            console.log('');
            process.exit(1);
        } else if (response.data.status === 'OK') {
            console.log('✅ SUCCESS! Geocoding is working correctly');
            console.log('');
            console.log('Results:');
            const result = response.data.results[0];
            console.log('  Formatted Address:', result.formatted_address);
            console.log('  Latitude:', result.geometry.location.lat);
            console.log('  Longitude:', result.geometry.location.lng);
            console.log('');
            console.log('Your Google Maps API is configured correctly!');
            console.log('The issue must be somewhere else in the app.');
        } else {
            console.log('⚠️  Unexpected Status:', response.data.status);
            console.log('');
            console.log('Full Response:');
            console.log(JSON.stringify(response.data, null, 2));
        }

    } catch (error) {
        console.error('❌ Request Failed');
        console.log('');
        console.log('Error:', error.message);

        if (error.response) {
            console.log('Response Status:', error.response.status);
            console.log('Response Data:', JSON.stringify(error.response.data, null, 2));
        }

        process.exit(1);
    }
}

testGeocoding();
