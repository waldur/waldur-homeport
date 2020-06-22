import { defaultCurrency, ENV } from '@waldur/core/services';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

export const EstimatedCostField = ({ row }) => {
  if (getActiveFixedPricePaymentProfile(row.payment_profiles)) {
    return DASH_ESCAPE_CODE;
  }
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
