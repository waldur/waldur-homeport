import { GearSix } from '@phosphor-icons/react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { Project } from '@waldur/workspace/types';

export const ProjectActions = ({ project }: { project: Project }) => {
  return (
    <Link
      state="project.manage"
      params={{ uuid: project.uuid }}
      className="btn btn-secondary me-3"
    >
      <span className="svg-icon svg-icon-2">
        <GearSix />
      </span>
      {translate('Manage')}
    </Link>
  );
};
