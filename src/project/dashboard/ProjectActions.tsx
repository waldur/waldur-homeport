import { HeadsetIcon } from '@phosphor-icons/react';
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

  const supportButton = (
    <Link
      state="project.issues"
      params={{ uuid: project.uuid }}
      buttonVariant="tertiary"
      buttonSize={isCourseProject ? 'sm' : 'lg'}
      buttonIconOnly={isCourseProject}
      aria-label={translate('Support')}
    >
      {/* Sized with size prop so icon's fill="currentColor" inherits button text color */}
      <HeadsetIcon weight="bold" size={20} />
      {!isCourseProject && translate('Support')}
    </Link>
  );

  return (
    <div className="flex gap-2">
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
