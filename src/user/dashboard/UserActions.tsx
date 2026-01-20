import { WarningIcon } from '@phosphor-icons/react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { hasSupport } from '@waldur/issues/hooks';

export const UserActions = () => {
  const showIssues = useSelector(hasSupport);
  return (
    <div>
      {showIssues && (
        <Link state="profile.issues" className="btn btn-secondary">
          <span className="svg-icon svg-icon-2">
            <WarningIcon weight="bold" />
          </span>
          {translate('Support')}
        </Link>
      )}
    </div>
  );
};
