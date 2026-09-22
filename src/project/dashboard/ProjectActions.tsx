import { HeadsetIcon, WarningIcon } from '@phosphor-icons/react';
import { Project } from 'waldur-js-client';

import { Tooltip } from 'waldur-ui';

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
    ? 'btn btn-tertiary btn-icon btn-sm'
    : 'btn btn-tertiary btn-lg';

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
    <div className="d-flex gap-2">
      {showIssues &&
        (isCourseProject ? (
          <Tooltip label={translate('Support')}>
            <span>{supportButton}</span>
          </Tooltip>
        ) : (
          supportButton
        ))}
    </div>
  );
};
