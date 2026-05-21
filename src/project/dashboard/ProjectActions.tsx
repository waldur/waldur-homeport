import { HeadsetIcon, WarningIcon } from '@phosphor-icons/react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Project } from 'waldur-js-client';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { hasSupport } from '@/issues/hooks';

interface ProjectActionsProps {
  project: Project;
}

export const ProjectActions = ({ project }: ProjectActionsProps) => {
  const showIssues = hasSupport();
  const isCourseProject = project.kind === 'course';

  const supportButtonClass = isCourseProject
    ? 'btn btn-secondary btn-icon btn-sm'
    : 'btn btn-secondary btn-lg';

  const supportButton = (
    <Link
      state="project.issues"
      params={{ uuid: project.uuid }}
      className={supportButtonClass}
      aria-label={translate('Support')}
    >
      <span className="svg-icon svg-icon-2">
        {isCourseProject ? (
          <HeadsetIcon weight="bold" />
        ) : (
          <WarningIcon weight="bold" />
        )}
      </span>
      {!isCourseProject && translate('Support')}
    </Link>
  );

  return (
    <div>
      {showIssues &&
        (isCourseProject ? (
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="project-support-tooltip">
                {translate('Support')}
              </Tooltip>
            }
          >
            <span>{supportButton}</span>
          </OverlayTrigger>
        ) : (
          supportButton
        ))}
    </div>
  );
};
