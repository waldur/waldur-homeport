export const getKeycloakMembershipRoleColor = (role: string) => {
  if (role.indexOf('admin') > -1) {
    return 'blue';
  } else if (role.indexOf('manage') > -1) {
    return 'info';
  } else if (role.indexOf('view') > -1) {
    return 'pink';
  } else if (role.indexOf('owner') > -1) {
    return 'dark';
  }
  return 'default';
};
