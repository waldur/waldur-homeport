import { DropdownButton } from 'react-bootstrap';
import { useBoolean } from 'react-use';

import { translate } from '@waldur/i18n';
import { Project } from '@waldur/workspace/types';

import { DeleteAction } from './DeleteAction';
import { MoveProjectAction } from './MoveProjectAction';

const ActionsList = [DeleteAction, MoveProjectAction];

interface ProjectsListActionsProps {
  project: Project;
}

export const ProjectsListActions = ({ project }: ProjectsListActionsProps) => {
  const [open, onToggle] = useBoolean(false);
  return (
    <DropdownButton
      title={translate('Actions')}
      id="project-list-actions-dropdown-btn"
      className="dropdown-btn"
      onToggle={onToggle}
      open={open}
      pullRight
    >
      {ActionsList.map((ActionComponent, index) => (
        <ActionComponent key={index} project={project} />
      ))}
    </DropdownButton>
  );
};
