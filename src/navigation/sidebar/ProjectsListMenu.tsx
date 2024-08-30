import { ClipboardText } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';

import { translate } from '@waldur/i18n';

import { isDescendantOf } from '../useTabs';

import { MenuItem } from './MenuItem';

export const ProjectsListMenu = () => {
  const { state } = useCurrentStateAndParams();

  return (
    <MenuItem
      title={translate('Projects')}
      state="projects"
      activeState={isDescendantOf('project', state) ? state.name : undefined}
      icon={<ClipboardText weight="bold" />}
      child={false}
    />
  );
};
