import { FunctionComponent } from 'react';

import { PaymentsPanel } from '@waldur/customer/payments/PaymentsPanel';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { PaymentProfilesPanel } from '../payment-profiles/PaymentProfilesPanel';
import { useCustomerItems } from '../utils';

import { CustomerActionsPanel } from './CustomerActionsPanel';
import { CustomerDetailsPanel } from './CustomerDetailsPanel';

export const CustomerManage: FunctionComponent = () => {
  useTitle(translate('Manage organization'));
  useCustomerItems();
  return (
    <>
      <CustomerDetailsPanel />
      <PaymentProfilesPanel />
      <PaymentsPanel />
      <CustomerActionsPanel />
    </>
  );
};
