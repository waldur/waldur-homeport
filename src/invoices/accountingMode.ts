import { isFeatureVisible } from '@/features/connect';
import { CustomerFeatures } from '@/FeaturesEnums';

export type AccountingMode = 'accounting' | 'billing';

/**
 * How the deployment presents costs, set globally by the
 * `customer.show_invoices_with_vat` feature flag (off by default).
 *
 * - `accounting`: costs and prices exclude VAT, and monthly records are
 *   shown as accounting records.
 * - `billing`: costs and prices include VAT, and monthly records are shown
 *   as invoices.
 */
export const getAccountingMode = (): AccountingMode =>
  isFeatureVisible(CustomerFeatures.show_invoices_with_vat)
    ? 'billing'
    : 'accounting';

export const isAccountingMode = () => getAccountingMode() === 'accounting';
