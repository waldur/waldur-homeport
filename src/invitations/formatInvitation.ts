import { translate } from '@waldur/i18n';
import { RoleType } from '@waldur/permissions/types';
import { formatRoleType } from '@waldur/permissions/utils';

// Minimal interface for invitation formatting
// Works with Invitation, GroupInvitation, and VisibleInvitationDetails
interface InvitationFormatFields {
  created_by_full_name: string;
  created_by_username: string;
  scope_name: string;
  scope_type: string | null;
  role_description: string;
}

export const formatInvitation = (invitation: InvitationFormatFields) =>
  translate('{sender} has invited you to join {name} {type} in {role} role.', {
    sender: invitation.created_by_full_name || invitation.created_by_username,
    name: invitation.scope_name,
    type: formatRoleType(invitation.scope_type as RoleType),
    role: invitation.role_description,
  });
