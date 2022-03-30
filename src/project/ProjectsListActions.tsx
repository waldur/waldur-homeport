import { DropdownButton } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Project } from '@waldur/workspace/types';

import { DeleteAction } from './DeleteAction';
import { MoveProjectAction } from './MoveProjectAction';

const ActionsList = [DeleteAction, MoveProjectAction];

interface ProjectsListActionsProps {
  project: Project;
}

export const ProjectsListActions = ({ project }: ProjectsListActionsProps) => (
  <DropdownButton
    title={translate('Actions')}
    id="project-list-actions-dropdown-btn"
    className="dropdown-btn"
  >
    {ActionsList.map((ActionComponent, index) => (
      <ActionComponent key={index} project={project} />
    ))}
  </DropdownButton>
);
