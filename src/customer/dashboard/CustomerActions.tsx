import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { SvgIcon } from '@waldur/core/svg/InlineSVG';
import { translate } from '@waldur/i18n';
import { hasSupport } from '@waldur/issues/hooks';

const IconCog = require('@waldur/images/cog-outline.svg');
const IconIssue = require('@waldur/images/exclamation-triangle-outline.svg');
const IconLogs = require('@waldur/images/search-logs.svg');

export const CustomerActions = ({ customer }) => {
  const showIssues = useSelector(hasSupport);
  return (
    <div>
      <Link
        state="organization.manage"
        params={{ uuid: customer.uuid }}
        className="btn btn-secondary me-3"
      >
        <SvgIcon path={IconCog} className="svg-icon-2" />
        {translate('Manage')}
      </Link>

      <Link
        state="organization.events"
        params={{ uuid: customer.uuid }}
        className="btn btn-secondary me-3"
      >
        <SvgIcon path={IconLogs} className="svg-icon-2" />
        {translate('Audit logs')}
      </Link>

      {showIssues && (
        <Link
          state="organization.issues"
          params={{ uuid: customer.uuid }}
          className="btn btn-secondary"
        >
          <SvgIcon path={IconIssue} className="svg-icon-2" />
          {translate('Issues')}
        </Link>
      )}
    </div>
  );
};
