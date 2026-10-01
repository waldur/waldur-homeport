import { Project, User } from 'waldur-js-client';

import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';

// Mirrors the API, which refuses rooms for removed projects.
export const canCreateMatrixRoom = (
  user: Pick<User, 'is_staff' | 'permissions'>,
  project: Pick<Project, 'uuid' | 'customer_uuid' | 'is_removed'>,
): boolean =>
  Boolean(project) &&
  !project.is_removed &&
  Boolean(
    hasPermission(user, {
      permission: PermissionEnum.CREATE_MATRIX_ROOM,
      projectId: project.uuid,
      customerId: project.customer_uuid,
    }),
  );
