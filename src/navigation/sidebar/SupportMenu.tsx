import { Headset } from '@phosphor-icons/react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

import { MenuItem } from './MenuItem';

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
      icon={<Headset />}
    />
  );
};
