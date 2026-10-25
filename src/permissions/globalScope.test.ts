import { afterEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';

import { PermissionEnum } from './enums';
import { hasConsumerPermission, hasPermission } from './hasPermission';

/**
 * A site-wide grant as /api/users/me reports it: the site scope, no
 * organization or project of its own.
 */
const deskGrant = {
  role_name: 'GLOBAL.ORDER_DESK',
  scope_type: 'global',
  scope_uuid: 'site-uuid',
  customer_uuid: null,
  project_uuid: null,
};

const desk: any = { is_staff: false, permissions: [deskGrant] };

const mockRoles = () =>
  vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
    {
      name: 'GLOBAL.ORDER_DESK',
      permissions: [
        PermissionEnum.APPROVE_ORDER,
        // Forced onto the role behind the API's back; must stay inert.
        PermissionEnum.CREATE_CUSTOMER_PERMISSION,
      ],
    },
  ] as any);

describe('hasPermission for a site-wide grant', () => {
  afterEach(() => vi.restoreAllMocks());

  it('holds the permission on any project and organization', () => {
    mockRoles();
    expect(
      hasPermission(desk, {
        permission: PermissionEnum.APPROVE_ORDER,
        customerId: 'any-customer',
        projectId: 'any-project',
      }),
    ).toBe(true);
    expect(
      hasConsumerPermission(desk, {
        permission: PermissionEnum.APPROVE_ORDER,
        projectId: 'any-project',
      }),
    ).toBe(true);
  });

  it('does not hold a permission the role does not carry', () => {
    mockRoles();
    expect(
      hasPermission(desk, {
        permission: PermissionEnum.REJECT_ORDER,
        customerId: 'any-customer',
      }),
    ).toBeFalsy();
  });

  it('never holds organization team management, even when the role lists it', () => {
    mockRoles();
    expect(
      hasPermission(desk, {
        permission: PermissionEnum.CREATE_CUSTOMER_PERMISSION,
        customerId: 'any-customer',
      }),
    ).toBeFalsy();
  });
});
