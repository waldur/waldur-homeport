import { Project, User } from 'waldur-js-client';

import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';

// Mirrors the API: whoever may create a room manages it, and support manages
// every room. Unlike creation, a removed project still counts: the export
// made on its termination is managed here.
export const canManageMatrixRoom = (
  user: Pick<User, 'is_staff' | 'is_support' | 'permissions'>,
  project: Pick<Project, 'uuid' | 'customer_uuid'>,
): boolean =>
  Boolean(user) &&
  Boolean(project) &&
  (Boolean(user.is_support) ||
    Boolean(
      hasPermission(user, {
        permission: PermissionEnum.CREATE_MATRIX_ROOM,
        projectId: project.uuid,
        customerId: project.customer_uuid,
      }),
    ));
