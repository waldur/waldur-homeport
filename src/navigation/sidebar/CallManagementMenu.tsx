import { useCurrentStateAndParams } from '@uirouter/react';
import { useSelector } from 'react-redux';

import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { getCustomer } from '@waldur/workspace/selectors';

import { MenuItem } from './MenuItem';

const Icon = require('./CallManagement.svg');

export const CallManagementMenu = () => {
  const customer = useSelector(getCustomer);
  const { state } = useCurrentStateAndParams();
  const visible = isFeatureVisible(
    'marketplace.show_call_management_functionality',
  );
  if (!visible || !customer?.call_managing_organization_uuid) {
    return null;
  }
  return (
    <MenuItem
      title={translate('Call management')}
      state="call-management.dashboard"
      activeState={
        ['call-management.dashboard'].some((name) => state.name.includes(name))
          ? state.name
          : undefined
      }
      params={{ uuid: customer.uuid }}
      child={false}
      iconPath={Icon}
    />
  );
};
