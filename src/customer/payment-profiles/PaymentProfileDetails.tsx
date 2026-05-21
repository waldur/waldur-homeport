import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { useCustomer } from '@/workspace/hooks';

export const PaymentProfileDetails: FunctionComponent = () => {
  const customer = useCustomer();
  if (!customer) {
    return null;
  }

  const profile = customer.payment_profiles?.find((p) => p.is_active);
  return profile ? (
    <div style={{ marginBottom: '20px' }}>
      <p>
        <b>{translate('Name')}: </b>
        {profile.name}
      </p>
      <p>
        <b>{translate('Type')}: </b>
        {profile.payment_type_display}
      </p>
    </div>
  ) : null;
};
