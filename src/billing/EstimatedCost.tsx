import * as React from 'react';
import { useSelector } from 'react-redux';

import { defaultCurrency } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { angular2react } from '@waldur/shims/angular2react';
import { getCustomer } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

const PriceEstimateButton = angular2react<{ customer: Customer }>(
  'priceEstimateButton',
  ['customer'],
);

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
      <PriceEstimateButton customer={customer} />
    </p>
  );
};
