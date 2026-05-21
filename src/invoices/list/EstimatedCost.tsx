import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';
import { financialReportsRetrieve } from 'waldur-js-client';

import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { getActiveFixedPricePaymentProfile } from '@/invoices/details/utils';
import { useCustomer } from '@/workspace/hooks';

const AsyncEstimatedCost = ({ customer }) => {
  const { value } = useAsync(() =>
    financialReportsRetrieve({ path: { uuid: customer.uuid } }),
  );
  if (!value) {
    return null;
  }
  return (
    <>
      <p className="text-muted text-uppercase fw-bolder mb-0">
        {translate('Estimated cost')}
      </p>
      <h2 className="mb-0">
        {defaultCurrency(value.data.billing_price_estimate.total)}
      </h2>
    </>
  );
};

export const EstimatedCost: FunctionComponent = () => {
  const customer = useCustomer();
  if (!customer) {
    return null;
  }
  if (getActiveFixedPricePaymentProfile(customer.payment_profiles)) {
    return null;
  }
  return <AsyncEstimatedCost customer={customer} />;
};
