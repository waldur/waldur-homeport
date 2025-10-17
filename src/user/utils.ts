const ROLE_COLORS = {
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
  'PROPOSAL.MANAGER': 'pink',
  'PROPOSAL.MEMBER': 'blue',
  Reviewer: 'blue',
};

export const getRoleColor = (roleName: string) =>
  ROLE_COLORS[roleName] || 'default';
