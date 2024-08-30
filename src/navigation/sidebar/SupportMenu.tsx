import { Headset } from '@phosphor-icons/react';

import { translate } from '@waldur/i18n';

import { MenuItem } from './MenuItem';

export const SupportMenu = () => {
  return (
    <MenuItem
      title={translate('Support')}
      state="support-dashboard"
      activeState="support"
      child={false}
      icon={<Headset weight="bold" />}
    />
  );
};
