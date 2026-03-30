import { User } from 'waldur-js-client';

export const isProjectMember = (user: User, projectUuid: string): boolean => {
  if (!user) {
    return false;
  }
  if (user.is_staff) {
    return true;
  }
  return (
    user.permissions?.some(
      (p) => p.scope_type === 'project' && p.scope_uuid === projectUuid,
    ) ?? false
  );
};
