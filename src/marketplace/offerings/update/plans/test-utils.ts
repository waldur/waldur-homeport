/**
 * Shared test utilities for plan dialog components
 * This file provides common test data to eliminate code duplication between test files
 */

// Common test data
export const mockOffering = {
  url: 'http://example.com/api/marketplace-offerings/offering-uuid/',
  uuid: 'offering-uuid',
  name: 'Test Offering',
};

export const mockPlan = {
  uuid: 'plan-uuid',
  name: 'Test Plan',
  unit: 'month',
  description: 'Test plan description',
  article_code: 'TEST001',
};
