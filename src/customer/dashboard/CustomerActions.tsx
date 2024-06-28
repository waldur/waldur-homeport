import { GearSix, Warning } from '@phosphor-icons/react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { hasSupport } from '@waldur/issues/hooks';

export const CustomerActions = ({ customer }) => {
  const showIssues = useSelector(hasSupport);
  return (
    <div>
      <Link
        state="organization.manage"
        params={{ uuid: customer.uuid }}
        className="btn btn-secondary me-3"
      >
        <span className="svg-icon svg-icon-2">
          <GearSix />
        </span>
        {translate('Manage')}
      </Link>

      {showIssues && (
        <Link
          state="organization.issues"
          params={{ uuid: customer.uuid }}
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
