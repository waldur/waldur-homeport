import { isFeatureVisible } from '@/features/connect';
import { CustomerFeatures } from '@/FeaturesEnums';

export type AccountingMode = 'accounting' | 'billing';

/**
 * How the deployment presents costs, set globally by the
 * `customer.billing_mode` feature flag (off by default).
 *
 * - `accounting`: costs and prices exclude VAT, and monthly records are
 *   shown as accounting records.
 * - `billing`: costs and prices include VAT, and monthly records are shown
 *   as invoices.
 */
export const getAccountingMode = (): AccountingMode =>
  isFeatureVisible(CustomerFeatures.billing_mode) ? 'billing' : 'accounting';

export const isAccountingMode = () => getAccountingMode() === 'accounting';
