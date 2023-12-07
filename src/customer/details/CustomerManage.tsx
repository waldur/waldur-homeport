import { FunctionComponent } from 'react';

import { isFeatureVisible } from '@waldur/features/connect';

import { CustomerCallManagerPanel } from './CustomerCallManagerPanel';
import { CustomerDetailsPanel } from './CustomerDetailsPanel';
import { CustomerMarketplacePanel } from './CustomerMarketplacePanel';
import { CustomerRemovePanel } from './CustomerRemovePanel';

export const CustomerManage: FunctionComponent = () => (
  <>
    <CustomerDetailsPanel />
    <CustomerMarketplacePanel />
    {!isFeatureVisible('marketplace.show_call_management_functionality') && (
      <CustomerCallManagerPanel />
    )}
    <CustomerRemovePanel />
  </>
);
