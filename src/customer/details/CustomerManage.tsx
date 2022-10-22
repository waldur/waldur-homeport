import { FunctionComponent } from 'react';

import { CustomerDetailsPanel } from './CustomerDetailsPanel';
import { CustomerMarketplacePanel } from './CustomerMarketplacePanel';
import { CustomerRemovePanel } from './CustomerRemovePanel';

export const CustomerManage: FunctionComponent = () => (
  <>
    <CustomerDetailsPanel />
    <CustomerMarketplacePanel />
    <CustomerRemovePanel />
  </>
);
