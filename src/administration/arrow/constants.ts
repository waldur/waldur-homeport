import type { ArrowBillingSyncStateEnum } from 'waldur-js-client';

import { BadgeVariant } from 'waldur-ui';

import { translate } from '@/i18n';

// As the backend's ArrowBillingSync.States: a sync is pending, its lines
// synced, the month validated against Arrow, then reconciled. None fails.
const BILLING_SYNC_STATE_LABELS: Record<ArrowBillingSyncStateEnum, string> = {
  1: translate('Pending'),
  2: translate('Synced'),
  3: translate('Validated'),
  4: translate('Reconciled'),
};

/** Get badge variant for billing sync state */
export const getBillingSyncStateVariant = (
  state: ArrowBillingSyncStateEnum,
): BadgeVariant => {
  switch (state) {
    case 4: // reconciled
      return 'success';
    case 3: // validated
      return 'primary';
    case 2: // synced
      return 'warning';
    case 1: // pending
      return 'neutral';
    default:
      return 'neutral';
  }
};

/** Get display label for billing sync state */
export const getBillingSyncStateLabel = (
  state: ArrowBillingSyncStateEnum,
): string => {
  return BILLING_SYNC_STATE_LABELS[state] || String(state);
};

/** Tab keys for Arrow dashboard */
export const ARROW_TAB_KEYS = {
  overview: 'overview',
  mappings: 'mappings',
  vendorOfferings: 'vendor-offerings',
  billing: 'billing',
  consumption: 'consumption',
  resources: 'resources',
  settings: 'settings',
  debug: 'debug',
} as const;
