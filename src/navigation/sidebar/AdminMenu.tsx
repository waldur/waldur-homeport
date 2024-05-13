import { GearSix } from '@phosphor-icons/react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

import { MenuItem } from './MenuItem';

export const AdminMenu = () => {
  const visible = useSelector(isStaffOrSupport);
  if (!visible) {
    return null;
  }
  return (
    <MenuItem
      title={translate('Administration')}
      state="admin.dashboard"
      activeState="admin"
      child={false}
      icon={<GearSix />}
    />
  );
};
