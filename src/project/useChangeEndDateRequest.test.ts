import { afterEach, describe, expect, it, vi } from 'vitest';
import { Permission, Project, User } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { PermissionEnum } from '@/permissions/enums';

import { canRequestProjectEndDateChange } from './useChangeEndDateRequest';

const PROJECT = {
  uuid: 'project-1',
  customer_uuid: 'customer-1',
} as Pick<Project, 'uuid' | 'customer_uuid'>;

const makeUser = (overrides: Partial<User> = {}): User =>
  ({
    is_staff: false,
    is_support: false,
    permissions: [],
    ...overrides,
  }) as User;

const role = (name: string, permissions: string[]) =>
  ({ name, permissions }) as any;

describe('canRequestProjectEndDateChange', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns false when there is no user', () => {
    expect(canRequestProjectEndDateChange(null, PROJECT)).toBe(false);
  });

  it('returns false for staff, who edit the project directly', () => {
    expect(
      canRequestProjectEndDateChange(makeUser({ is_staff: true }), PROJECT),
    ).toBe(false);
  });

  it('returns true for a project member who cannot edit the project', () => {
    const user = makeUser({
      permissions: [
        { scope_type: 'project', scope_uuid: 'project-1' } as Permission,
      ],
    });
    expect(canRequestProjectEndDateChange(user, PROJECT)).toBe(true);
  });

  it('returns false for a project member who can edit the project', () => {
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      role('PROJECT.ADMIN', [PermissionEnum.UPDATE_PROJECT]),
    ]);
    const user = makeUser({
      permissions: [
        {
          scope_type: 'project',
          scope_uuid: 'project-1',
          role_name: 'PROJECT.ADMIN',
        } as Permission,
      ],
    });
    expect(canRequestProjectEndDateChange(user, PROJECT)).toBe(false);
  });

  it('returns true for a site-wide project list grant that cannot edit', () => {
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      role('GLOBAL.DESK', [PermissionEnum.LIST_PROJECTS]),
    ]);
    const user = makeUser({
      permissions: [
        {
          scope_type: 'global',
          scope_uuid: 'site',
          role_name: 'GLOBAL.DESK',
        } as Permission,
      ],
    });
    expect(canRequestProjectEndDateChange(user, PROJECT)).toBe(true);
  });

  it('returns false for a site-wide grant that can edit the project', () => {
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      role('GLOBAL.DESK', [
        PermissionEnum.LIST_PROJECTS,
        PermissionEnum.UPDATE_PROJECT,
      ]),
    ]);
    const user = makeUser({
      permissions: [
        {
          scope_type: 'global',
          scope_uuid: 'site',
          role_name: 'GLOBAL.DESK',
        } as Permission,
      ],
    });
    expect(canRequestProjectEndDateChange(user, PROJECT)).toBe(false);
  });

  it('returns false for a site-wide role that cannot see projects', () => {
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      role('GLOBAL.ORDERS', [PermissionEnum.LIST_ORDERS]),
    ]);
    const user = makeUser({
      permissions: [
        {
          scope_type: 'global',
          scope_uuid: 'site',
          role_name: 'GLOBAL.ORDERS',
        } as Permission,
      ],
    });
    expect(canRequestProjectEndDateChange(user, PROJECT)).toBe(false);
  });

  it('offers the request to an organization role that can list its projects', () => {
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      role('CUSTOMER.READER', [PermissionEnum.LIST_PROJECTS]),
    ]);
    const user = makeUser({
      permissions: [
        {
          scope_type: 'customer',
          scope_uuid: 'customer-1',
          role_name: 'CUSTOMER.READER',
        } as Permission,
      ],
    });
    expect(canRequestProjectEndDateChange(user, PROJECT)).toBe(true);
  });

  it('returns false for an organization role that can edit the project', () => {
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      role('CUSTOMER.OWNER', [PermissionEnum.UPDATE_PROJECT]),
    ]);
    const user = makeUser({
      permissions: [
        {
          scope_type: 'customer',
          scope_uuid: 'customer-1',
          role_name: 'CUSTOMER.OWNER',
        } as Permission,
      ],
    });
    expect(canRequestProjectEndDateChange(user, PROJECT)).toBe(false);
  });

  it('returns false for an organization role that cannot list projects', () => {
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      role('CUSTOMER.ORDERS', [PermissionEnum.LIST_ORDERS]),
    ]);
    const user = makeUser({
      permissions: [
        {
          scope_type: 'customer',
          scope_uuid: 'customer-1',
          role_name: 'CUSTOMER.ORDERS',
        } as Permission,
      ],
    });
    expect(canRequestProjectEndDateChange(user, PROJECT)).toBe(false);
  });

  it('returns false for project list on a different organization', () => {
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      role('CUSTOMER.READER', [PermissionEnum.LIST_PROJECTS]),
    ]);
    const user = makeUser({
      permissions: [
        {
          scope_type: 'customer',
          scope_uuid: 'customer-2',
          role_name: 'CUSTOMER.READER',
        } as Permission,
      ],
    });
    expect(canRequestProjectEndDateChange(user, PROJECT)).toBe(false);
  });
});
