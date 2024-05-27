import { Buildings } from '@phosphor-icons/react';

import { translate } from '@waldur/i18n';

import { MenuItem } from './MenuItem';

export const OrganizationsListMenu = () => {
  return (
    <MenuItem
      title={translate('Organizations')}
      state="organizations"
      icon={<Buildings />}
      child={false}
    />
  );
};
