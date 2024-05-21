import { ClipboardText } from '@phosphor-icons/react';

import { translate } from '@waldur/i18n';

import { MenuItem } from './MenuItem';

export const ProjectsListMenu = () => {
  return (
    <MenuItem
      title={translate('Projects')}
      state="profile.projects"
      icon={<ClipboardText />}
      child={false}
    />
  );
};
