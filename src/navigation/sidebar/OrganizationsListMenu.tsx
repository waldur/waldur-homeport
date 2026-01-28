import { BuildingsIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC } from 'react';

import { translate } from '@waldur/i18n';

import { isDescendantOf } from '../useTabs';

import { MenuItem } from './MenuItem';

interface OrganizationsListMenuProps {
  disabled?: boolean;
  disabledTooltip?: string;
}

export const OrganizationsListMenu: FC<OrganizationsListMenuProps> = ({
  disabled,
  disabledTooltip,
}) => {
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
      icon={<BuildingsIcon weight="bold" />}
      child={false}
      disabled={disabled}
      disabledTooltip={disabledTooltip}
    />
  );
};
