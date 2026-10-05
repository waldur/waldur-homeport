import { FC } from 'react';
import { Project } from 'waldur-js-client';

import { ActionsMenu } from '@/table/ActionsDropdown';

import { ChangeEndDateAction } from './ChangeEndDateAction';
import { DeleteAction } from './DeleteAction';
import { MoveProjectAction } from './MoveProjectAction';
import { ProjectEditAction } from './ProjectEditAction';

const ActionsList = [
  MoveProjectAction,
  ProjectEditAction,
  ChangeEndDateAction,
  DeleteAction,
];

interface ProjectsListActionsProps {
  project: Project;
  refetch;
}

export const ProjectsListActions: FC<ProjectsListActionsProps> = ({
  project,
  refetch,
}) => (
  <ActionsMenu>
    {ActionsList.map((ActionComponent, index) => (
      <ActionComponent key={index} project={project} refetch={refetch} />
    ))}
  </ActionsMenu>
);
