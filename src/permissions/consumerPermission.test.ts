import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';

import { PermissionEnum } from './enums';
import { hasConsumerPermission, hasPermission } from './hasPermission';

const role = (
  role_name: string,
  scope_type: string,
  scope_uuid: string,
  customer_uuid = 'customer-uuid',
) => ({ role_name, scope_type, scope_uuid, customer_uuid });

const userWith = (...permissions): any => ({ is_staff: false, permissions });

// The provider organization's own project ordered one of its offerings, so
// the order's consumer organization is also the provider organization.
const consumerRequest = {
  permission: PermissionEnum.APPROVE_ORDER,
  customerId: 'customer-uuid',
  projectId: 'project-uuid',
};

describe('hasConsumerPermission', () => {
  beforeEach(() => {
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      {
        name: 'CUSTOMER.MANAGER',
        permissions: [
          PermissionEnum.LIST_ORDERS,
          PermissionEnum.APPROVE_ORDER,
          PermissionEnum.REJECT_ORDER,
        ],
      },
      { name: 'CUSTOMER.OWNER', permissions: [PermissionEnum.APPROVE_ORDER] },
      { name: 'PROJECT.ADMIN', permissions: [PermissionEnum.APPROVE_ORDER] },
      { name: 'PROJECT.MEMBER', permissions: [] },
    ] as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not count a role on the organization service provider', () => {
    const manager = userWith(
      role('CUSTOMER.MANAGER', 'service_provider', 'provider-uuid'),
    );

    // The provider side still sees it: that is what hasPermission is for.
    expect(hasPermission(manager, consumerRequest)).toBe(true);
    expect(hasConsumerPermission(manager, consumerRequest)).toBe(false);
  });

  it('grants a project role carrying the permission', () => {
    const admin = userWith(role('PROJECT.ADMIN', 'project', 'project-uuid'));

    expect(hasConsumerPermission(admin, consumerRequest)).toBe(true);
  });

  it('grants an organization role carrying the permission', () => {
    const owner = userWith(role('CUSTOMER.OWNER', 'customer', 'customer-uuid'));

    expect(hasConsumerPermission(owner, consumerRequest)).toBe(true);
  });

  it('grants a service provider manager who also holds a consumer role', () => {
    const user = userWith(
      role('CUSTOMER.MANAGER', 'service_provider', 'provider-uuid'),
      role('PROJECT.ADMIN', 'project', 'project-uuid'),
    );

    expect(hasConsumerPermission(user, consumerRequest)).toBe(true);
  });

  it('does not grant a role without the permission', () => {
    const member = userWith(role('PROJECT.MEMBER', 'project', 'project-uuid'));

    expect(hasConsumerPermission(member, consumerRequest)).toBe(false);
  });

  it('does not grant a role on another project or organization', () => {
    const user = userWith(
      role('PROJECT.ADMIN', 'project', 'other-project'),
      role('CUSTOMER.OWNER', 'customer', 'other-customer', 'other-customer'),
    );

    expect(hasConsumerPermission(user, consumerRequest)).toBe(false);
  });

  it('grants staff', () => {
    expect(
      hasConsumerPermission({ is_staff: true } as any, consumerRequest),
    ).toBe(true);
  });
});
