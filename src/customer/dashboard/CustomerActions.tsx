import { Warning } from '@phosphor-icons/react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { hasSupport } from '@waldur/issues/hooks';

export const CustomerActions = ({ customer }) => {
  const showIssues = useSelector(hasSupport);
  return (
    <div>
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
