import { describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';

import { PermissionEnum } from './enums';
import { hasPermission } from './hasPermission';

/**
 * A user can hold more than one role on the same scope — the call Team tab
 * grants CALL.MANAGER and CALL.PANEL_MEMBER from the same list, and real data
 * carries users with both. Only one of them carries CALL.UPDATE, so resolving
 * a single entry per scope made the answer depend on which one the server
 * listed first.
 */
const role = (role_name: string) => ({
  role_name,
  role_uuid: `${role_name}-uuid`,
  scope_type: 'call',
  scope_uuid: 'call-uuid',
  customer_uuid: 'customer-uuid',
  customer_name: 'Demo Organization',
  project_uuid: null,
  resource_uuid: null,
  expiration_time: null,
});

const withRoles = (fn: () => void) => {
  vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
    { name: 'CALL.MANAGER', permissions: [PermissionEnum.UPDATE_CALL] },
    { name: 'CALL.PANEL_MEMBER', permissions: [] },
    { name: 'CALL.REVIEWER', permissions: [] },
  ] as any);
  try {
    fn();
  } finally {
    vi.restoreAllMocks();
  }
};

const canUpdate = (user: any) =>
  hasPermission(user, {
    permission: PermissionEnum.UPDATE_CALL,
    scopeId: 'call-uuid',
  });

describe('hasPermission when a user holds several roles on one scope', () => {
  it('grants the permission when the carrying role is listed first', () => {
    withRoles(() => {
      const user: any = {
        is_staff: false,
        permissions: [role('CALL.MANAGER'), role('CALL.PANEL_MEMBER')],
      };
      expect(canUpdate(user)).toBe(true);
    });
  });

  // The regression: the same user, the same roles, only the order differs.
  it('grants the permission when the carrying role is listed last', () => {
    withRoles(() => {
      const user: any = {
        is_staff: false,
        permissions: [role('CALL.PANEL_MEMBER'), role('CALL.MANAGER')],
      };
      expect(canUpdate(user)).toBe(true);
    });
  });

  it('still denies a user whose roles all lack the permission', () => {
    withRoles(() => {
      const user: any = {
        is_staff: false,
        permissions: [role('CALL.PANEL_MEMBER'), role('CALL.REVIEWER')],
      };
      expect(canUpdate(user)).toBeFalsy();
    });
  });

  it('does not leak the permission to a different call', () => {
    withRoles(() => {
      const user: any = {
        is_staff: false,
        permissions: [role('CALL.MANAGER')],
      };
      expect(
        hasPermission(user, {
          permission: PermissionEnum.UPDATE_CALL,
          scopeId: 'another-call',
        }),
      ).toBeFalsy();
    });
  });
});
