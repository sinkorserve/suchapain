/**
 * Export Service
 * Handles data export functionality (CSV, analytics reports)
 */

import fs from 'fs/promises';
import path from 'path';

export class ExportService {
  /**
   * Generate CSV from product events
   * @param {Array} events - Product events to export
   * @returns {string} CSV content
   */
  generateCSV(events) {
    const headers = [
      'Report ID',
      'Category',
      'Make',
      'Model',
      'Model Number',
      'Issue',
      'Location',
      'Zip Code',
      'Created Date',
      'Share Address',
      'Share Model Number',
      'Permission Requests'
    ];

    const rows = events.map(event => [
      event.id || '',
      event.category || '',
      event.make || '',
      event.model || '',
      event.modelNumber || '[PRIVATE]',
      this.escapeCSV(event.issue || ''),
      event.address || event.nearestIntersection || '[PRIVATE]',
      event.zipCode || '',
      event.createdAt ? new Date(event.createdAt).toISOString() : '',
      event.shareFullAddress ? 'Yes' : 'No',
      event.shareModelNumber ? 'Yes' : 'No',
      event.permissionRequests || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => this.escapeCSV(cell)).join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Generate analytics markdown report
   * @param {Object} analytics - Analytics data
   * @param {Object} filters - Filters used for the report
   * @returns {string} Markdown content
   */
  generateAnalyticsReport(analytics, filters = {}) {
    const filterDesc = this.describeFilters(filters);
    const date = new Date().toLocaleDateString();

    let markdown = `# Product CRM Analytics Report\n\n`;
    markdown += `**Generated:** ${date}\n`;
    markdown += `**Filters:** ${filterDesc}\n\n`;

    markdown += `---\n\n`;
    markdown += `## Executive Summary\n\n`;
    markdown += `- **Total Reports:** ${analytics.totalReports}\n`;
    markdown += `- **Reports with Private Data:** ${analytics.privacyStats.totalPrivate}\n`;
    markdown += `- **Permission Requests:** ${analytics.permissionRequests.total}\n`;
    markdown += `  - Pending: ${analytics.permissionRequests.pending}\n`;
    markdown += `  - Approved: ${analytics.permissionRequests.approved}\n`;
    markdown += `  - Denied: ${analytics.permissionRequests.denied}\n\n`;

    markdown += `---\n\n`;
    markdown += `## Issues by Category\n\n`;
    const sortedCategories = Object.entries(analytics.byCategory)
      .sort((a, b) => b[1] - a[1]);
    markdown += `| Category | Count | Percentage |\n`;
    markdown += `|----------|-------|------------|\n`;
    sortedCategories.forEach(([category, count]) => {
      const percentage = ((count / analytics.totalReports) * 100).toFixed(1);
      markdown += `| ${category} | ${count} | ${percentage}% |\n`;
    });
    markdown += `\n`;

    markdown += `---\n\n`;
    markdown += `## Top Manufacturers\n\n`;
    const sortedMakes = Object.entries(analytics.byMake)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    markdown += `| Manufacturer | Issues | Percentage |\n`;
    markdown += `|--------------|--------|------------|\n`;
    sortedMakes.forEach(([make, count]) => {
      const percentage = ((count / analytics.totalReports) * 100).toFixed(1);
      markdown += `| ${make} | ${count} | ${percentage}% |\n`;
    });
    markdown += `\n`;

    markdown += `---\n\n`;
    markdown += `## Geographic Distribution\n\n`;
    const sortedZipCodes = Object.entries(analytics.byZipCode)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    markdown += `| Zip Code | Reports | Percentage |\n`;
    markdown += `|----------|---------|------------|\n`;
    sortedZipCodes.forEach(([zipCode, count]) => {
      const percentage = ((count / analytics.totalReports) * 100).toFixed(1);
      markdown += `| ${zipCode} | ${count} | ${percentage}% |\n`;
    });
    markdown += `\n`;

    markdown += `---\n\n`;
    markdown += `## Privacy Statistics\n\n`;
    markdown += `- **Share Full Address:** ${analytics.privacyStats.shareFullAddress} reports (${((analytics.privacyStats.shareFullAddress / analytics.totalReports) * 100).toFixed(1)}%)\n`;
    markdown += `- **Share Model Number:** ${analytics.privacyStats.shareModelNumber} reports (${((analytics.privacyStats.shareModelNumber / analytics.totalReports) * 100).toFixed(1)}%)\n`;
    markdown += `- **Keep Data Private:** ${analytics.privacyStats.totalPrivate} reports (${((analytics.privacyStats.totalPrivate / analytics.totalReports) * 100).toFixed(1)}%)\n\n`;

    markdown += `---\n\n`;
    markdown += `## Recommendations\n\n`;
    markdown += this.generateRecommendations(analytics);

    return markdown;
  }

  /**
   * Generate recommendations based on analytics
   * @param {Object} analytics - Analytics data
   * @returns {string} Recommendations markdown
   */
  generateRecommendations(analytics) {
    let recommendations = '';

    // Top category recommendation
    const topCategory = Object.entries(analytics.byCategory)
      .sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      recommendations += `1. **Focus on ${topCategory[0]}:** This category accounts for the most reports (${topCategory[1]}). Consider prioritizing quality improvements in this area.\n\n`;
    }

    // Top manufacturer recommendation
    const topMake = Object.entries(analytics.byMake)
      .sort((a, b) => b[1] - a[1])[0];
    if (topMake) {
      recommendations += `2. **Investigate ${topMake[0]}:** This manufacturer has the highest number of reported issues (${topMake[1]}). Review product quality and warranty policies.\n\n`;
    }

    // Geographic concentration
    const topZip = Object.entries(analytics.byZipCode)
      .sort((a, b) => b[1] - a[1])[0];
    if (topZip) {
      const concentration = ((topZip[1] / analytics.totalReports) * 100).toFixed(1);
      if (concentration > 20) {
        recommendations += `3. **Geographic Focus:** Zip code ${topZip[0]} shows high concentration of issues (${concentration}%). Consider local outreach or service improvements.\n\n`;
      }
    }

    // Privacy recommendation
    if (analytics.privacyStats.totalPrivate > analytics.totalReports * 0.8) {
      recommendations += `4. **Privacy Awareness:** ${((analytics.privacyStats.totalPrivate / analytics.totalReports) * 100).toFixed(1)}% of users keep their data private. This indicates strong privacy awareness.\n\n`;
    }

    // Permission requests
    if (analytics.permissionRequests.pending > 0) {
      recommendations += `5. **Pending Permissions:** ${analytics.permissionRequests.pending} permission requests are pending. Encourage users to review and respond to access requests.\n\n`;
    }

    return recommendations || 'No specific recommendations at this time.\n\n';
  }

  /**
   * Describe filters used in a report
   * @param {Object} filters - Filters object
   * @returns {string} Filter description
   */
  describeFilters(filters) {
    const parts = [];

    if (filters.category) parts.push(`Category: ${filters.category}`);
    if (filters.make) parts.push(`Make: ${filters.make}`);
    if (filters.model) parts.push(`Model: ${filters.model}`);
    if (filters.zipCode) parts.push(`Zip Code: ${filters.zipCode}`);
    if (filters.startDate) parts.push(`From: ${new Date(filters.startDate).toLocaleDateString()}`);
    if (filters.endDate) parts.push(`To: ${new Date(filters.endDate).toLocaleDateString()}`);

    return parts.length > 0 ? parts.join(', ') : 'None';
  }

  /**
   * Escape CSV values to prevent injection and formatting issues
   * @param {any} value - Value to escape
   * @returns {string} Escaped value
   */
  escapeCSV(value) {
    if (value === null || value === undefined) return '';

    const stringValue = String(value);

    // If contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }

  /**
   * Save content to file
   * @param {string} content - Content to save
   * @param {string} filename - Output filename
   * @param {string} directory - Output directory
   * @returns {Promise<string>} Full file path
   */
  async saveToFile(content, filename, directory = './exports') {
    await fs.mkdir(directory, { recursive: true });
    const filePath = path.join(directory, filename);
    await fs.writeFile(filePath, content, 'utf-8');
    return filePath;
  }
}
