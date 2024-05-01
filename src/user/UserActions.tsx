import { Link } from '@waldur/core/Link';
import { SvgIcon } from '@waldur/core/svg/InlineSVG';
import { translate } from '@waldur/i18n';
import { hasSupport } from '@waldur/issues/hooks';

const IconCog = require('@waldur/images/cog-outline.svg');
const IconIssue = require('@waldur/images/exclamation-triangle-outline.svg');
const IconLogs = require('@waldur/images/search-logs.svg');

export const UserActions = () => (
  <>
    <Link state="profile.manage" className="btn btn-secondary me-3">
      <SvgIcon path={IconCog} className="svg-icon-2" />
      {translate('Manage')}
    </Link>

    <Link state="profile.events" className="btn btn-secondary me-3">
      <SvgIcon path={IconLogs} className="svg-icon-2" />
      {translate('Audit logs')}
    </Link>

    {hasSupport && (
      <Link state="profile.issues" className="btn btn-secondary me-3">
        <SvgIcon path={IconIssue} className="svg-icon-2" />
        {translate('Issues')}
      </Link>
    )}
  </>
);
