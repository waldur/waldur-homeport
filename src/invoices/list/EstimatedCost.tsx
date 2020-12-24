import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';
import { getCustomer } from '@waldur/workspace/selectors';

export const EstimatedCost: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  if (!customer) {
    return null;
  }
  return !getActiveFixedPricePaymentProfile(customer.payment_profiles) ? (
    <p>
      {translate('Estimated cost for the current month: {cost}', {
        cost: defaultCurrency(customer.billing_price_estimate.total),
      })}
    </p>
  ) : null;
};
