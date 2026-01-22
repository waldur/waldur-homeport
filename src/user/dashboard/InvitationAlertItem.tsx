import { FC } from 'react';
import { Invitation, RoleType } from 'waldur-js-client';

import { AlertItem } from '@waldur/core/AlertItem';
import { translate } from '@waldur/i18n';
import { formatRoleType } from '@waldur/permissions/utils';

import { ExpiryBadge } from './ExpiryBadge';

interface InvitationAlertItemProps {
  invitation: Invitation;
}

export const InvitationAlertItem: FC<InvitationAlertItemProps> = ({
  invitation,
}) => {
  const inviterName =
    invitation.created_by_full_name || invitation.created_by_username;
  const scopeType = formatRoleType(invitation.scope_type as RoleType);

  return (
    <AlertItem
      variant="info"
      title={invitation.scope_name}
      titleAfter={<ExpiryBadge expires={invitation.expires} />}
      body={
        <div>
          <div className="text-muted">
            {inviterName
              ? translate('Invited by {inviter} to join as {role} ({type})', {
                  inviter: inviterName,
                  role: invitation.role_name,
                  type: scopeType,
                })
              : translate('Join as {role} ({type})', {
                  role: invitation.role_name,
                  type: scopeType,
                })}
          </div>
          {invitation.extra_invitation_text && (
            <div className="text-muted mt-1 fst-italic">
              "{invitation.extra_invitation_text}"
            </div>
          )}
        </div>
      }
    />
  );
};
