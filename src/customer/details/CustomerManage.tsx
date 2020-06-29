import * as React from 'react';

import { PaymentsPanel } from '@waldur/customer/payments/PaymentsPanel';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { angular2react } from '@waldur/shims/angular2react';

import { PaymentProfilesPanel } from '../payment-profiles/PaymentProfilesPanel';

import { CustomerActionsPanel } from './CustomerActionsPanel';
import { CustomerDetailsPanel } from './CustomerDetailsPanel';

const CustomerPoliciesPanel = angular2react('customerPoliciesPanel');

export const CustomerManage = () => {
  useTitle(translate('Manage organization'));
  return (
    <div style={{ paddingLeft: 10 }}>
      <CustomerDetailsPanel />
      <CustomerPoliciesPanel />
      <PaymentProfilesPanel />
      <PaymentsPanel />
      <CustomerActionsPanel />
    </div>
  );
};
