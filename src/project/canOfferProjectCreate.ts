import { User } from 'waldur-js-client';

import { PermissionEnum } from '@/permissions/enums';
import {
  hasPermission,
  hasPermissionOnAnyCustomer,
} from '@/permissions/hasPermission';

export const canOfferProjectCreate = (
  user: User | null | undefined,
): boolean => {
  if (!user) {
    return false;
  }
  if (hasPermissionOnAnyCustomer(user, PermissionEnum.CREATE_PROJECT)) {
    return true;
  }
  if (!hasPermission(user, { permission: PermissionEnum.CREATE_PROJECT })) {
    return false;
  }
  if (user.is_support) {
    return true;
  }
  return (
    user.permissions?.some(
      (permission) =>
        permission.scope_type === 'customer' ||
        permission.scope_type === 'project',
    ) ?? false
  );
};
