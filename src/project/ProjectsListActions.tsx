import { FC } from 'react';
import { Project } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';

import { DeleteAction } from './DeleteAction';
import { MoveProjectAction } from './MoveProjectAction';
import { ProjectEditAction } from './ProjectEditAction';

const ActionsList = [MoveProjectAction, ProjectEditAction, DeleteAction];

interface ProjectsListActionsProps {
  project: Project;
  refetch;
}

export const ProjectsListActions: FC<ProjectsListActionsProps> = ({
  project,
  refetch,
}) => (
  <ActionsDropdownComponent title={translate('Actions')}>
    {ActionsList.map((ActionComponent, index) => (
      <ActionComponent key={index} project={project} refetch={refetch} />
    ))}
  </ActionsDropdownComponent>
);
