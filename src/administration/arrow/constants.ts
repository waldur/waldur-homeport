import type { ArrowBillingSyncStateEnum } from 'waldur-js-client';

import { translate } from '@waldur/i18n';

/** Billing sync state enum values from SDK:
 * 1 = pending
 * 2 = syncing
 * 3 = synced
 * 4 = failed
 */
const BILLING_SYNC_STATE_LABELS: Record<ArrowBillingSyncStateEnum, string> = {
  1: translate('Pending'),
  2: translate('Syncing'),
  3: translate('Synced'),
  4: translate('Failed'),
};

/** Get badge variant for billing sync state */
export const getBillingSyncStateVariant = (
  state: ArrowBillingSyncStateEnum,
): 'success' | 'primary' | 'warning' | 'danger' | 'default' => {
  switch (state) {
    case 3: // synced
      return 'success';
    case 2: // syncing
      return 'warning';
    case 1: // pending
      return 'primary';
    case 4: // failed
      return 'danger';
    default:
      return 'default';
  }
};

/** Get display label for billing sync state */
export const getBillingSyncStateLabel = (
  state: ArrowBillingSyncStateEnum,
): string => {
  return BILLING_SYNC_STATE_LABELS[state] || String(state);
};

/** Form names for redux-form */
export const ARROW_FORM_NAMES = {
  customerMappingsFilter: 'ArrowCustomerMappingsFilter',
  billingSyncFilter: 'ArrowBillingSyncFilter',
  consumptionRecordsFilter: 'ArrowConsumptionRecordsFilter',
  customerMappingForm: 'ArrowCustomerMappingForm',
  credentialsForm: 'ArrowCredentialsForm',
  arrowResourcesFilter: 'ArrowResourcesFilter',
  vendorOfferingMappingsFilter: 'ArrowVendorOfferingMappingsFilter',
} as const;

/** Tab keys for Arrow dashboard */
export const ARROW_TAB_KEYS = {
  overview: 'overview',
  mappings: 'mappings',
  vendorOfferings: 'vendor-offerings',
  billing: 'billing',
  consumption: 'consumption',
  resources: 'resources',
  debug: 'debug',
} as const;
