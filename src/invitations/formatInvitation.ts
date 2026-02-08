import { translate } from '@waldur/i18n';
import { RoleType } from '@waldur/permissions/types';
import { formatRoleType } from '@waldur/permissions/utils';

// Minimal interface for invitation formatting
// Works with Invitation, GroupInvitation, and VisibleInvitationDetails
interface InvitationFormatFields {
  created_by_full_name: string | null;
  created_by_username: string | null;
  scope_name: string;
  scope_type: string | null;
  role_description: string;
}

export const formatInvitation = (
  invitation: InvitationFormatFields,
  hideSender?: boolean,
) => {
  const sender = hideSender
    ? null
    : invitation.created_by_full_name || invitation.created_by_username;
  if (sender) {
    return translate(
      '{sender} has invited you to join {name} {type} in {role} role.',
      {
        sender,
        name: invitation.scope_name,
        type: formatRoleType(invitation.scope_type as RoleType),
        role: invitation.role_description,
      },
    );
  }
  return translate(
    'You have been invited to join {name} {type} in {role} role.',
    {
      name: invitation.scope_name,
      type: formatRoleType(invitation.scope_type as RoleType),
      role: invitation.role_description,
    },
  );
};
