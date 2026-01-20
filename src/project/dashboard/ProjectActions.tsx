import { WarningIcon } from '@phosphor-icons/react';
import { useSelector } from 'react-redux';
import { Project } from 'waldur-js-client';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { hasSupport } from '@waldur/issues/hooks';

interface ProjectActionsProps {
  project: Project;
}

export const ProjectActions = ({ project }: ProjectActionsProps) => {
  const showIssues = useSelector(hasSupport);
  return (
    <div>
      {showIssues && (
        <Link
          state="project.issues"
          params={{ uuid: project.uuid }}
          className="btn btn-secondary"
        >
          <span className="svg-icon svg-icon-2">
            <WarningIcon weight="bold" />
          </span>
          {translate('Support')}
        </Link>
      )}
    </div>
  );
};
