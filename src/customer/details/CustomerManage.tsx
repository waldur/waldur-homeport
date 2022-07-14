import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { useCustomerItems } from '../utils';

import { CustomerActionsPanel } from './CustomerActionsPanel';
import { CustomerDetailsPanel } from './CustomerDetailsPanel';

export const CustomerManage: FunctionComponent = () => {
  useTitle(translate('Manage organization'));
  useCustomerItems();
  return (
    <>
      <CustomerDetailsPanel />
      <CustomerActionsPanel />
    </>
  );
};
