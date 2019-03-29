import { ENV, defaultCurrency } from '@waldur/core/services';

export const CurrentCostField = ({ row }) => {
  const estimate = row.billing_price_estimate;
  if (!estimate) {
    return defaultCurrency(0);
  }
  // VAT is not included only when accounting mode is activated
  if (ENV.accountingMode === 'accounting') {
    return defaultCurrency(estimate.current);
  } else {
    return defaultCurrency(parseFloat(estimate.current) + parseFloat(estimate.tax_current));
  }
};
