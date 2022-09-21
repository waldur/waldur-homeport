import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { getCustomer } from '@waldur/workspace/selectors';

import { CustomerDetailsPanel } from './CustomerDetailsPanel';
import { CustomerMarketplacePanel } from './CustomerMarketplacePanel';
import { CustomerRemovePanel } from './CustomerRemovePanel';

export const CustomerManage: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  useTitle(
    translate('Settings'),
    translate('Organization') + ': ' + customer.display_name,
  );

  return (
    <>
      <CustomerDetailsPanel />
      <CustomerMarketplacePanel />
      <CustomerRemovePanel />
    </>
  );
};
