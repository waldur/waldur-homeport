import { useCurrentStateAndParams } from '@uirouter/react';
import { useSelector } from 'react-redux';

import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { getCustomer } from '@waldur/workspace/selectors';

import { MenuItem } from './MenuItem';

const Icon = require('./CallManagement.svg');

export const CallManagementMenu = () => {
  const customer = useSelector(getCustomer);
  const { state } = useCurrentStateAndParams();
  const visible = isFeatureVisible(
    MarketplaceFeatures.show_call_management_functionality,
  );
  if (!visible || !customer?.call_managing_organization_uuid) {
    return null;
  }
  return (
    <MenuItem
      title={translate('Call management')}
      state="call-management.dashboard"
      activeState={
        ['call-management', 'protected-call'].some(
          (name) =>
            state.name.includes(name) || String(state.parent).includes(name),
        )
          ? state.name
          : undefined
      }
      params={{ uuid: customer.uuid }}
      child={false}
      iconPath={Icon}
    />
  );
};
