import { ClipboardTextIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC } from 'react';

import { translate } from '@waldur/i18n';

import { isDescendantOf } from '../useTabs';

import { MenuItem } from './MenuItem';

interface ProjectsListMenuProps {
  disabled?: boolean;
  disabledTooltip?: string;
}

export const ProjectsListMenu: FC<ProjectsListMenuProps> = ({
  disabled,
  disabledTooltip,
}) => {
  const { state } = useCurrentStateAndParams();

  return (
    <MenuItem
      title={translate('Projects')}
      state="projects"
      activeState={isDescendantOf('project', state) ? state.name : undefined}
      icon={<ClipboardTextIcon weight="bold" />}
      child={false}
      disabled={disabled}
      disabledTooltip={disabledTooltip}
    />
  );
};
