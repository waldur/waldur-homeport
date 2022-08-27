import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { PaymentProfilesPanel } from '../payment-profiles/PaymentProfilesPanel';

export const CustomerPaymentProfiles: FunctionComponent = () => {
  useTitle(translate('Payment profiles'));
  return <PaymentProfilesPanel />;
};
