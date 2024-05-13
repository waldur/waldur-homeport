import { GearSix, ListMagnifyingGlass, Warning } from '@phosphor-icons/react';

import { ENV } from '@waldur/configs/default';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { Project } from '@waldur/workspace/types';

export const ProjectActions = ({ project }: { project: Project }) => {
  const showIssues = ENV.plugins.WALDUR_SUPPORT.ENABLED;

  return (
    <div>
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

      <Link
        state="project.events"
        params={{ uuid: project.uuid }}
        className="btn btn-secondary me-3"
      >
        <span className="svg-icon svg-icon-2">
          <ListMagnifyingGlass />
        </span>
        {translate('Audit logs')}
      </Link>

      {showIssues && (
        <Link
          state="project.issues"
          params={{ uuid: project.uuid }}
          className="btn btn-secondary"
        >
          <span className="svg-icon svg-icon-2">
            <Warning />
          </span>
          {translate('Issues')}
        </Link>
      )}
    </div>
  );
};
