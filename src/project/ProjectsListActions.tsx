import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';
import { Project } from '@waldur/workspace/types';

import { DeleteAction } from './DeleteAction';
import { MoveProjectAction } from './MoveProjectAction';

const ActionsList = [DeleteAction, MoveProjectAction];

interface ProjectsListActionsProps {
  project: Project;
}

export const ProjectsListActions: FC<ProjectsListActionsProps> = ({
  project,
}) => (
  <ActionsDropdownComponent title={translate('Actions')}>
    {ActionsList.map((ActionComponent, index) => (
      <ActionComponent key={index} project={project} />
    ))}
  </ActionsDropdownComponent>
);
