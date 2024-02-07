import { translate } from '@waldur/i18n';
import { formatRoleType } from '@waldur/permissions/utils';

import { Invitation } from './types';

export const formatInvitation = (invitation: Invitation) =>
  translate('{sender} has invited you to join {name} {type} in {role} role.', {
    sender: invitation.created_by_full_name || invitation.created_by_username,
    name: invitation.scope_name,
    type: formatRoleType(invitation.scope_type),
    role: invitation.role_description,
  });
