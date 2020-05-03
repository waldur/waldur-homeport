import * as React from 'react';
import { useSelector } from 'react-redux';

import { defaultCurrency } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { getCustomer } from '@waldur/workspace/selectors';

export const EstimatedCost = () => {
  const customer = useSelector(getCustomer);
  if (!customer) {
    return null;
  }
  return (
    <p>
      {translate('Estimated cost for the current month: {cost}', {
        cost: defaultCurrency(customer.billing_price_estimate.total),
      })}
    </p>
  );
};
