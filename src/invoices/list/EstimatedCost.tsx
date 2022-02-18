import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { getById } from '@waldur/core/api';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';
import { getCustomer } from '@waldur/workspace/selectors';

const getPriceEstimate = (uuid: string) =>
  getById<{ billing_price_estimate: { total: number } }>(
    '/financial-reports/',
    uuid,
  );

const AsyncEstimatedCost = ({ customer }) => {
  const { value } = useAsync(() => getPriceEstimate(customer.uuid));
  if (!value) {
    return null;
  }
  return (
    <p>
      {translate('Estimated cost for the current month: {cost}', {
        cost: defaultCurrency(value.billing_price_estimate.total),
      })}
    </p>
  );
};

export const EstimatedCost: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  if (!customer) {
    return null;
  }
  if (getActiveFixedPricePaymentProfile(customer.payment_profiles)) {
    return null;
  }
  return <AsyncEstimatedCost customer={customer} />;
};
