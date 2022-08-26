import { FunctionComponent } from 'react';

import { PaymentsPanel } from '@waldur/customer/payments/PaymentsPanel';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { PaymentProfilesPanel } from '../payment-profiles/PaymentProfilesPanel';

export const CustomerPayments: FunctionComponent = () => {
  useTitle(translate('Payments'));
  return (
    <>
      <PaymentProfilesPanel />
      <PaymentsPanel />
    </>
  );
};
