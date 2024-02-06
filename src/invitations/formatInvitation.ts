import { translate } from '@waldur/i18n';

import { Invitation } from './types';

const SCOPE_TYPES = {
  project: translate('project'),
  customer: translate('organization'),
  offering: translate('offering'),
};

export const formatInvitation = (invitation: Invitation) =>
  translate('{sender} has invited you to join {name} {type} in {role} role.', {
    sender: invitation.created_by_full_name || invitation.created_by_username,
    name: invitation.scope_name,
    type: SCOPE_TYPES[invitation.scope_type],
    role: invitation.role_description,
  });
