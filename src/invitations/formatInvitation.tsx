import { formatJsxTemplate, translate } from '@/i18n';
import { RoleType } from '@/permissions/types';
import { formatRoleType } from '@/permissions/utils';

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
        name: <strong>{invitation.scope_name}</strong>,
        type: formatRoleType(invitation.scope_type as RoleType),
        role: <strong>{invitation.role_description}</strong>,
      },
      formatJsxTemplate,
    );
  }
  return translate(
    'You have been invited to join {name} {type} in {role} role.',
    {
      name: <strong>{invitation.scope_name}</strong>,
      type: formatRoleType(invitation.scope_type as RoleType),
      role: <strong>{invitation.role_description}</strong>,
    },
    formatJsxTemplate,
  );
};
