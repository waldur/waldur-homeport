import { describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import { PermissionEnum } from './enums';
import { hasPermission } from './hasPermission';

/**
 * An offering manager holds a role on the offering itself and nothing on the
 * parent customer. The backend authorises them (see
 * `UserRoleCreateSerializer.validate`, which accepts a permission held on the
 * scope), so the frontend gate has to resolve the offering scope too.
 */
const offeringManager = () => {
  (ENV as any).roles = [
    {
      name: 'OFFERING.MANAGER',
      permissions: [
        PermissionEnum.CREATE_OFFERING_PERMISSION,
        PermissionEnum.DELETE_OFFERING_PERMISSION,
      ],
    },
  ];
  return {
    is_staff: false,
    permissions: [
      {
        scope_uuid: 'offering-uuid',
        scope_type: 'offering',
        role_name: 'OFFERING.MANAGER',
      },
    ],
  } as any;
};

describe('hasPermission with an offering scope', () => {
  it('resolves a permission held directly on the offering', () => {
    expect(
      hasPermission(offeringManager(), {
        permission: PermissionEnum.DELETE_OFFERING_PERMISSION,
        offeringId: 'offering-uuid',
      }),
    ).toBe(true);
  });

  it('is falsy for a different offering', () => {
    expect(
      hasPermission(offeringManager(), {
        permission: PermissionEnum.DELETE_OFFERING_PERMISSION,
        offeringId: 'other-offering-uuid',
      }),
    ).toBeFalsy();
  });

  it('is falsy for a permission the offering role does not grant', () => {
    expect(
      hasPermission(offeringManager(), {
        permission: PermissionEnum.UPDATE_OFFERING_PERMISSION,
        offeringId: 'offering-uuid',
      }),
    ).toBeFalsy();
  });

  it('does not leak into the call/proposal scopeId branch', () => {
    expect(
      hasPermission(offeringManager(), {
        permission: PermissionEnum.DELETE_OFFERING_PERMISSION,
        scopeId: 'offering-uuid',
      }),
    ).toBeFalsy();
  });

  it('still resolves a permission held on the parent customer', () => {
    (ENV as any).roles = [
      {
        name: 'CUSTOMER.OWNER',
        permissions: [PermissionEnum.DELETE_OFFERING_PERMISSION],
      },
    ];
    const owner = {
      is_staff: false,
      permissions: [
        {
          scope_uuid: 'customer-uuid',
          scope_type: 'customer',
          role_name: 'CUSTOMER.OWNER',
        },
      ],
    } as any;
    expect(
      hasPermission(owner, {
        permission: PermissionEnum.DELETE_OFFERING_PERMISSION,
        customerId: 'customer-uuid',
        offeringId: 'offering-uuid',
      }),
    ).toBe(true);
  });
});
