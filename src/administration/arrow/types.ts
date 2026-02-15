// Arrow Integration Types
// All API types are imported from 'waldur-js-client'
// This file only contains local UI state types

import type {
  ArrowCustomerDiscovery,
  CustomerMappingSuggestion,
  ExportTypeCompatibility,
  WaldurCustomerBrief,
} from 'waldur-js-client';

/** Form values for Arrow setup wizard (stored in React Final Form) */
export interface ArrowSetupFormValues {
  api_url: string;
  api_key: string;
  credentialsValid: boolean;
  partnerInfo: Record<string, unknown> | null;
  discoveryComplete: boolean;
  customers: ArrowCustomerDiscovery[];
  waldurCustomers: WaldurCustomerBrief[];
  suggestions: CustomerMappingSuggestion[];
  exportTypes: ExportTypeCompatibility[];
  selectedMappings: Record<string, string>; // arrow_reference -> waldur_customer_uuid
}
