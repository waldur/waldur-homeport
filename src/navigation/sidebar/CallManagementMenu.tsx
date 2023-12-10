import { useSelector } from 'react-redux';

import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { getCustomer } from '@waldur/workspace/selectors';

import { MenuItem } from './MenuItem';

const Icon = require('./CallManagement.svg');

export const CallManagementMenu = () => {
  const customer = useSelector(getCustomer);
  const visible = isFeatureVisible(
    'marketplace.show_call_management_functionality',
  );
  if (!visible || !customer || !customer.is_call_managing_organization) {
    return null;
  }
  return (
    <MenuItem
      title={translate('Call management')}
      state="#"
      activeState="call"
      child={false}
      iconPath={Icon}
    />
  );
};
