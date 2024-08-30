import { GearSix } from '@phosphor-icons/react';

import { translate } from '@waldur/i18n';

import { MenuItem } from './MenuItem';

export const AdminMenu = () => {
  return (
    <MenuItem
      title={translate('Administration')}
      state="admin.dashboard"
      activeState="admin"
      child={false}
      icon={<GearSix weight="bold" />}
    />
  );
};
