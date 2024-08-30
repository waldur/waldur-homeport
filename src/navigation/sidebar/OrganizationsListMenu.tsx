import { Buildings } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';

import { translate } from '@waldur/i18n';

import { isDescendantOf } from '../useTabs';

import { MenuItem } from './MenuItem';

export const OrganizationsListMenu = () => {
  const { state } = useCurrentStateAndParams();

  return (
    <MenuItem
      title={translate('Organizations')}
      state="organizations"
      activeState={
        isDescendantOf('organization', state) ||
        isDescendantOf('call-management', state) ||
        isDescendantOf('marketplace-provider', state)
          ? state.name
          : undefined
      }
      icon={<Buildings weight="bold" />}
      child={false}
    />
  );
};
