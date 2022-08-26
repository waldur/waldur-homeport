import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { CustomerDetailsPanel } from './CustomerDetailsPanel';
import { CustomerMarketplacePanel } from './CustomerMarketplacePanel';
import { CustomerRemovePanel } from './CustomerRemovePanel';

export const CustomerManage: FunctionComponent = () => {
  useTitle(translate('Manage organization'));

  return (
    <>
      <CustomerDetailsPanel />
      <CustomerMarketplacePanel />
      <CustomerRemovePanel />
    </>
  );
};
