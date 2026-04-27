import { WarningIcon } from '@phosphor-icons/react';
import { useSelector } from 'react-redux';
import { User } from 'waldur-js-client';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { hasSupport } from '@/issues/hooks';
import { VersionHistoryButton } from '@/version-history';

interface UserActionsProps {
  user?: User;
}

export const UserActions = ({ user }: UserActionsProps) => {
  const showIssues = useSelector(hasSupport);
  return (
    <div className="d-flex gap-2">
      {showIssues && (
        <Link state="profile.issues" className="btn btn-secondary">
          <span className="svg-icon svg-icon-2">
            <WarningIcon weight="bold" />
          </span>
          {translate('Support')}
        </Link>
      )}
      {user && (
        <VersionHistoryButton
          entityType="user"
          entityUuid={user.uuid}
          entityName={user.full_name}
        />
      )}
    </div>
  );
};
