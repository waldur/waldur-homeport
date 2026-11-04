import { afterEach, describe, expect, it, vi } from 'vitest';
import { Permission, User } from 'waldur-js-client';

import { ENV } from '@/core/config';

import { canAccessProjectDashboard } from './canAccessProjectDashboard';
import { PermissionEnum } from './enums';

const PROJECT_UUID = 'project-1';
const CUSTOMER_UUID = 'customer-1';

const projectPermission = (scopeUuid: string): Permission =>
  ({ scope_type: 'project', scope_uuid: scopeUuid }) as Permission;

const customerPermission = (scopeUuid: string): Permission =>
  ({ scope_type: 'customer', scope_uuid: scopeUuid }) as Permission;

const makeUser = (overrides: Partial<User> = {}): User =>
  ({
    is_staff: false,
    is_support: false,
    permissions: [],
    ...overrides,
  }) as User;

describe('canAccessProjectDashboard', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns false when there is no user', () => {
    expect(canAccessProjectDashboard(null, PROJECT_UUID)).toBe(false);
  });

  it('returns true for staff users', () => {
    expect(
      canAccessProjectDashboard(makeUser({ is_staff: true }), PROJECT_UUID),
    ).toBe(true);
  });

  it('returns true for support users', () => {
    expect(
      canAccessProjectDashboard(makeUser({ is_support: true }), PROJECT_UUID),
    ).toBe(true);
  });

  it('returns true for a user with a matching project permission', () => {
    const user = makeUser({ permissions: [projectPermission(PROJECT_UUID)] });
    expect(canAccessProjectDashboard(user, PROJECT_UUID)).toBe(true);
  });

  it('returns true for a user with customer permission on the project organization', () => {
    const user = makeUser({ permissions: [customerPermission(CUSTOMER_UUID)] });
    expect(canAccessProjectDashboard(user, PROJECT_UUID, CUSTOMER_UUID)).toBe(
      true,
    );
  });

  it('opens a project for a site-wide grant of project list', () => {
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      {
        name: 'GLOBAL.DESK',
        permissions: [PermissionEnum.LIST_PROJECTS],
      },
    ] as any);
    const user = makeUser({
      permissions: [
        {
          scope_type: 'global',
          role_name: 'GLOBAL.DESK',
          scope_uuid: 'site',
        } as Permission,
      ],
    });
    expect(canAccessProjectDashboard(user, PROJECT_UUID)).toBe(true);
  });

  it('keeps a site-wide role without project list out of the project', () => {
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      {
        name: 'GLOBAL.ORDERS',
        permissions: [PermissionEnum.LIST_ORDERS],
      },
    ] as any);
    const user = makeUser({
      permissions: [
        {
          scope_type: 'global',
          role_name: 'GLOBAL.ORDERS',
          scope_uuid: 'site',
        } as Permission,
      ],
    });
    expect(canAccessProjectDashboard(user, PROJECT_UUID)).toBe(false);
  });

  it('returns false for a service provider user without project or customer access', () => {
    const user = makeUser({
      permissions: [projectPermission('other-project')],
    });
    expect(canAccessProjectDashboard(user, PROJECT_UUID, CUSTOMER_UUID)).toBe(
      false,
    );
  });
});
