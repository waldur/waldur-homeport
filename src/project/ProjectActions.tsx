import { ENV } from '@waldur/configs/default';
import { Link } from '@waldur/core/Link';
import { SvgIcon } from '@waldur/core/svg/InlineSVG';
import { translate } from '@waldur/i18n';
import { Project } from '@waldur/workspace/types';

const IconCog = require('@waldur/images/cog-outline.svg');
const IconIssue = require('@waldur/images/exclamation-triangle-outline.svg');
const IconLogs = require('@waldur/images/search-logs.svg');

export const ProjectActions = ({ project }: { project: Project }) => {
  const showIssues = ENV.plugins.WALDUR_SUPPORT.ENABLED;

  return (
    <div>
      <Link
        state="project.manage"
        params={{ uuid: project.uuid }}
        className="btn btn-secondary me-3"
      >
        <SvgIcon path={IconCog} className="svg-icon-2" />
        {translate('Manage')}
      </Link>

      <Link
        state="project.events"
        params={{ uuid: project.uuid }}
        className="btn btn-secondary me-3"
      >
        <SvgIcon path={IconLogs} className="svg-icon-2" />
        {translate('Audit logs')}
      </Link>

      {showIssues && (
        <Link
          state="project.issues"
          params={{ uuid: project.uuid }}
          className="btn btn-secondary"
        >
          <SvgIcon path={IconIssue} className="svg-icon-2" />
          {translate('Issues')}
        </Link>
      )}
    </div>
  );
};
