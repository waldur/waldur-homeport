// Arrow Integration Types
// All API types are imported from 'waldur-js-client'
// This file only contains local UI state types

import type {
  ArrowCredentialsRequest,
  ArrowCustomerDiscovery,
  CustomerMappingSuggestion,
  WaldurCustomerBrief,
} from 'waldur-js-client';

/** Discovery state for setup wizard (local UI state only) */
export interface ArrowDiscoveryState {
  credentials: ArrowCredentialsRequest | null;
  credentialsValid: boolean;
  partnerInfo: Record<string, unknown> | null;
  customers: ArrowCustomerDiscovery[];
  waldurCustomers: WaldurCustomerBrief[];
  suggestions: CustomerMappingSuggestion[];
  selectedMappings: Map<string, string>; // arrow_reference -> waldur_customer_uuid
}

/** Initial state for setup wizard */
export const INITIAL_DISCOVERY_STATE: ArrowDiscoveryState = {
  credentials: null,
  credentialsValid: false,
  partnerInfo: null,
  customers: [],
  waldurCustomers: [],
  suggestions: [],
  selectedMappings: new Map(),
};
