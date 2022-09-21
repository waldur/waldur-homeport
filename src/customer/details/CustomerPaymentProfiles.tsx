import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { getCustomer } from '@waldur/workspace/selectors';

import { PaymentProfilesPanel } from '../payment-profiles/PaymentProfilesPanel';

export const CustomerPaymentProfiles: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  useTitle(
    translate('Payment profiles'),
    translate('Organization') + ': ' + customer.display_name,
  );

  return <PaymentProfilesPanel />;
};
