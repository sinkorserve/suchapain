/**
 * Geocoding Service
 * Handles address geocoding using Google Maps API
 */

import axios from 'axios';

export class GeocodingService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
  }

  /**
   * Geocode an address to get coordinates and location details
   * @param {string} address - Full address to geocode
   * @returns {Promise<Object>} Location details
   */
  async geocodeAddress(address) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          address: address,
          key: this.apiKey
        }
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Geocoding failed: ${response.data.status}`);
      }

      const result = response.data.results[0];
      const location = result.geometry.location;

      // Extract address components
      const addressComponents = this.parseAddressComponents(result.address_components);

      // Get nearest intersection
      const nearestIntersection = await this.getNearestIntersection(location.lat, location.lng);

      // Get zip code center for display location
      const displayLocation = await this.getZipCodeCenter(addressComponents.zipCode);

      return {
        exactLocation: {
          lat: location.lat,
          lng: location.lng
        },
        displayLocation: displayLocation || location,
        zipCode: addressComponents.zipCode,
        nearestIntersection: nearestIntersection,
        formattedAddress: result.formatted_address
      };
    } catch (error) {
      throw new Error(`Geocoding error: ${error.message}`);
    }
  }

  /**
   * Parse address components from Google Maps response
   * @param {Array} components - Address components array
   * @returns {Object} Parsed components
   */
  parseAddressComponents(components) {
    const parsed = {
      streetNumber: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    };

    components.forEach(component => {
      const types = component.types;

      if (types.includes('street_number')) {
        parsed.streetNumber = component.long_name;
      }
      if (types.includes('route')) {
        parsed.street = component.long_name;
      }
      if (types.includes('locality')) {
        parsed.city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        parsed.state = component.short_name;
      }
      if (types.includes('postal_code')) {
        parsed.zipCode = component.long_name;
      }
      if (types.includes('country')) {
        parsed.country = component.long_name;
      }
    });

    return parsed;
  }

  /**
   * Get nearest intersection for approximate location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<string>} Nearest intersection
   */
  async getNearestIntersection(lat, lng) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          latlng: `${lat},${lng}`,
          result_type: 'intersection',
          key: this.apiKey
        }
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const intersection = response.data.results[0].formatted_address;
        // Extract just the intersection part (first two streets)
        const parts = intersection.split(',');
        return parts[0];
      }

      // Fallback: use reverse geocode to get street
      return await this.getStreetName(lat, lng);
    } catch (error) {
      return 'Intersection unavailable';
    }
  }

  /**
   * Get street name from coordinates
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<string>} Street name
   */
  async getStreetName(lat, lng) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          latlng: `${lat},${lng}`,
          result_type: 'street_address',
          key: this.apiKey
        }
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const components = response.data.results[0].address_components;
        const street = components.find(c => c.types.includes('route'));
        return street ? street.long_name : 'Street unavailable';
      }

      return 'Street unavailable';
    } catch (error) {
      return 'Street unavailable';
    }
  }

  /**
   * Get center coordinates of a zip code for display location
   * @param {string} zipCode - Zip code
   * @returns {Promise<Object>} Coordinates of zip code center
   */
  async getZipCodeCenter(zipCode) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          address: zipCode,
          key: this.apiKey
        }
      });

      if (response.data.status === 'OK') {
        return response.data.results[0].geometry.location;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   * @param {number} lat1 - First latitude
   * @param {number} lng1 - First longitude
   * @param {number} lat2 - Second latitude
   * @param {number} lng2 - Second longitude
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees - Degrees
   * @returns {number} Radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
}
