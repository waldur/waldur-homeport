import { FC } from 'react';
import { DropdownButton } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
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
  <DropdownButton title={translate('Actions')} className="dropdown-btn">
    {ActionsList.map((ActionComponent, index) => (
      <ActionComponent key={index} project={project} />
    ))}
  </DropdownButton>
);
