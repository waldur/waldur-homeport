import { describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import { PermissionEnum } from './enums';
import { hasAllPermissions } from './hasPermission';

const withRole = (permissions: string[]) => {
  (ENV as any).roles = [{ name: 'CUSTOMER.OWNER', permissions }];
  return {
    is_staff: false,
    permissions: [
      {
        scope_uuid: 'customer-uuid',
        scope_type: 'customer',
        role_name: 'CUSTOMER.OWNER',
      },
    ],
  } as any;
};

const scope = { customerId: 'customer-uuid' };
const both = [
  PermissionEnum.UPDATE_RESOURCE_LIMITS,
  PermissionEnum.CREATE_ORDER,
];

describe('hasAllPermissions', () => {
  it('is true only when every permission is held', () => {
    const user = withRole([
      PermissionEnum.UPDATE_RESOURCE_LIMITS,
      PermissionEnum.CREATE_ORDER,
    ]);
    expect(hasAllPermissions(user, both, scope)).toBe(true);
  });

  it('is false when one of the permissions is missing', () => {
    const user = withRole([PermissionEnum.UPDATE_RESOURCE_LIMITS]);
    expect(hasAllPermissions(user, both, scope)).toBe(false);
  });

  it('is false when the scope does not match', () => {
    const user = withRole([
      PermissionEnum.UPDATE_RESOURCE_LIMITS,
      PermissionEnum.CREATE_ORDER,
    ]);
    expect(hasAllPermissions(user, both, { customerId: 'other-uuid' })).toBe(
      false,
    );
  });

  it('is true for staff regardless of roles', () => {
    const user = withRole([]);
    expect(hasAllPermissions({ ...user, is_staff: true }, both, scope)).toBe(
      true,
    );
  });
});
