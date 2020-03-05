import { defaultCurrency, ENV } from '@waldur/core/services';

export const EstimatedCostField = ({ row }) => {
  const estimate = row.billing_price_estimate;
  if (!estimate) {
    return defaultCurrency(0);
  }
  // VAT is not included only when accounting mode is activated
  if (ENV.accountingMode === 'accounting') {
    return defaultCurrency(estimate.total);
  } else {
    return defaultCurrency(
      parseFloat(estimate.total) + parseFloat(estimate.tax),
    );
  }
};
