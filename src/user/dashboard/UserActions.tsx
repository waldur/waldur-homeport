import { ChatCircleTextIcon, WarningIcon } from '@phosphor-icons/react';
import { User } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { hasSupport } from '@/issues/hooks';
import { useStaffRequest } from '@/issues/staff-request/useStaffRequest';
import { VersionHistoryButton } from '@/version-history';

interface UserActionsProps {
  user?: User;
}

export const UserActions = ({ user }: UserActionsProps) => {
  const showIssues = hasSupport();
  const staffRequest = useStaffRequest(user);
  return (
    <div className="d-flex gap-2">
      {showIssues && (
        <Link state="profile.issues" buttonVariant="secondary" buttonSize="lg">
          <span className="svg-icon svg-icon-2">
            <WarningIcon weight="bold" />
          </span>
          {translate('Support')}
        </Link>
      )}
      {staffRequest.canOpen && (
        <BaseButton
          label={translate('Open support request')}
          onClick={staffRequest.open}
          iconNode={<ChatCircleTextIcon weight="bold" />}
          variant="secondary"
          size="lg"
          disabled={!user.is_active}
          tooltip={
            !user.is_active
              ? translate('A deactivated user cannot see or answer a request.')
              : undefined
          }
        />
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
