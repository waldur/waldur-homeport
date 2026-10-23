import {
  OfferingComponent,
  ResourceApiKeyState,
  ResourceApiKeyStatus,
} from 'waldur-js-client';

import { SpendingLimitPeriod } from '@/marketplace/common/spendingLimits';

export type ApiKeyState = ResourceApiKeyState;

export type ApiKeyRow = ResourceApiKeyStatus;

export interface KeyComponent {
  type: string;
  name?: string | null;
  measured_unit?: string | null;
  // Periods other than month are offered to keys where the component offers
  // them to resources.
  billing_type?: OfferingComponent['billing_type'];
  spending_limit_periods?: OfferingComponent['spending_limit_periods'];
  // The periods a key may limit on the component, as the backend offers them
  // (getResourceKeyComponents); unset, month and the component's own periods,
  // as on an offering that reports per-key daily usage.
  keyPeriods?: SpendingLimitPeriod[];
}
