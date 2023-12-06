import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';

import { MenuItem } from './MenuItem';

const Icon = require('./CallManagement.svg');

export const CallManagementMenu = () => {
  const visible = isFeatureVisible(
    'marketplace.show_call_management_functionality',
  );
  if (!visible) {
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
