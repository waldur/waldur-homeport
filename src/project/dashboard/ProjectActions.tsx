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

  const supportButton = (
    <Link
      state="project.issues"
      params={{ uuid: project.uuid }}
      buttonVariant="tertiary"
      buttonSize={isCourseProject ? 'sm' : 'lg'}
      buttonIconOnly={isCourseProject}
      aria-label={translate('Support')}
    >
      {/* size (not a `.svg-icon` wrapper) for the exact px dimensions --
          `.svg-icon`'s color mixin sets a fixed muted-gray fill with
          nothing to override it now this Link carries no `.btn` (see
          ActionsDropdown.tsx's TableDropdownToggle for the full
          explanation) -- letting the icon's own fill="currentColor"
          inherit the button's actual text color instead. */}
      {isCourseProject ? (
        <HeadsetIcon weight="bold" size={20} />
      ) : (
        <WarningIcon weight="bold" size={20} />
      )}
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
