import * as React from 'react';

import { angular2react } from '@waldur/shims/angular2react';

import { PaymentProfilesPanel } from '../payment-profiles/PaymentProfilesPanel';

import { CustomerActionsPanel } from './CustomerActionsPanel';
import { CustomerDetailsPanel } from './CustomerDetailsPanel';

const CustomerPoliciesPanel = angular2react('customerPoliciesPanel');

export const CustomerManage = () => (
  <div style={{ paddingLeft: 10 }}>
    <CustomerDetailsPanel />
    <CustomerPoliciesPanel />
    <PaymentProfilesPanel />
    <CustomerActionsPanel />
  </div>
);
