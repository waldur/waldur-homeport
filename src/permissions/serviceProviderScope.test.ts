import { describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';

import { PermissionEnum } from './enums';
import { hasPermission } from './hasPermission';

/**
 * "Service provider manager" (CUSTOMER.MANAGER) is defined on
 * marketplace.serviceprovider, so /api/users/me reports it with
 * `scope_type: 'service_provider'` and the provider's own `scope_uuid`. This is
 * the shape the local backend returns, verbatim.
 */
const providerPermission = {
  role_name: 'CUSTOMER.MANAGER',
  role_uuid: '3850b112738a4009b46af34a38013692',
  scope_type: 'service_provider',
  scope_uuid: 'provider-uuid',
  customer_uuid: 'customer-uuid',
  customer_name: 'Demo Organization',
  project_uuid: null,
  resource_uuid: null,
  expiration_time: null,
};

const manager: any = { is_staff: false, permissions: [providerPermission] };

const withRoles = (fn: () => void) => {
  vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
    { name: 'CUSTOMER.MANAGER', permissions: [PermissionEnum.CREATE_OFFERING] },
    { name: 'CUSTOMER.OWNER', permissions: [PermissionEnum.UPDATE_CUSTOMER] },
  ] as any);
  try {
    fn();
  } finally {
    vi.restoreAllMocks();
  }
};

describe('hasPermission for a role scoped to a service provider', () => {
  it('grants a permission the role carries, keyed on the provider customer', () => {
    withRoles(() => {
      expect(
        hasPermission(manager, {
          customerId: 'customer-uuid',
          permission: PermissionEnum.CREATE_OFFERING,
        }),
      ).toBe(true);
    });
  });

  // The point of looking the role up in ENV.roles: this widens which
  // permissions are consulted, never what a role is allowed to do.
  it('does not grant a permission the role does not carry', () => {
    withRoles(() => {
      expect(
        hasPermission(manager, {
          customerId: 'customer-uuid',
          permission: PermissionEnum.UPDATE_CUSTOMER,
        }),
      ).toBeFalsy();
    });
  });

  it('does not leak to a different organization', () => {
    withRoles(() => {
      expect(
        hasPermission(manager, {
          customerId: 'another-customer',
          permission: PermissionEnum.CREATE_OFFERING,
        }),
      ).toBeFalsy();
    });
  });

  it('does not match the provider uuid as if it were a customer', () => {
    withRoles(() => {
      expect(
        hasPermission(manager, {
          customerId: 'provider-uuid',
          permission: PermissionEnum.CREATE_OFFERING,
        }),
      ).toBeFalsy();
    });
  });
});
