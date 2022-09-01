import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

import { MenuItem } from './MenuItem';

const Icon = require('./Administration.svg');

export const AdminMenu = () => {
  const visible = useSelector(isStaffOrSupport);
  if (!visible) {
    return null;
  }
  return (
    <MenuItem
      title={translate('Administration')}
      state="admin.users"
      activeState="admin"
      child={false}
      iconPath={Icon}
    />
  );
};
