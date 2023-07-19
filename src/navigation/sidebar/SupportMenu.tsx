import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

import { MenuItem } from './MenuItem';

const Icon = require('./Support.svg');

export const SupportMenu = () => {
  const visible = useSelector(isStaffOrSupport);
  if (!visible) {
    return null;
  }
  return (
    <MenuItem
      title={translate('Support')}
      state="support-dashboard"
      activeState="support"
      child={false}
      iconPath={Icon}
    />
  );
};
