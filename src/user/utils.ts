import { BadgeVariant } from 'waldur-ui';

import { ENV } from '@/core/config';

const ROLE_COLORS: Record<string, BadgeVariant> = {
  'CALL.MANAGER': 'orange',
  'CALL.REVIEWER': 'blue',
  'CUSTOMER.CALL_ORGANIZER': 'purple',
  'CUSTOMER.MANAGER': 'purple',
  'CUSTOMER.OWNER': 'purple',
  'CUSTOMER.READER': 'teal',
  'CUSTOMER.SUPPORT': 'orange',
  'OFFERING.MANAGER': 'pink',
  'PROJECT.ADMIN': 'indigo',
  'PROJECT.MANAGER': 'pink',
  'PROJECT.MEMBER': 'rose',
  'PROPOSAL.ADMIN': 'indigo',
  'PROPOSAL.MANAGER': 'pink',
  'PROPOSAL.MEMBER': 'blue',
  Reviewer: 'blue',
};

// Used for a custom role (or an organization's clone) that is not one of the
// built-in roles above and has no built-in template.
const SCOPE_COLORS: Record<string, BadgeVariant> = {
  proposal: 'blue',
};

export const getRoleColor = (roleName: string): BadgeVariant => {
  if (ROLE_COLORS[roleName]) {
    return ROLE_COLORS[roleName];
  }
  const role = ENV.roles?.find((role) => role.name === roleName);
  return (
    (role?.template_name && ROLE_COLORS[role.template_name]) ||
    (role && SCOPE_COLORS[role.content_type]) ||
    'neutral'
  );
};
