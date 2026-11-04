import { afterEach, describe, expect, it, vi } from 'vitest';
import { Permission, User } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { PermissionEnum } from '@/permissions/enums';

import { canOfferProjectCreate } from './canOfferProjectCreate';

const makeUser = (overrides: Partial<User> = {}): User =>
  ({
    is_staff: false,
    is_support: false,
    permissions: [],
    ...overrides,
  }) as User;

const role = (name: string, permissions: string[]) =>
  ({ name, permissions }) as any;

describe('canOfferProjectCreate', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns false when there is no user', () => {
    expect(canOfferProjectCreate(null)).toBe(false);
  });

  it('returns true for staff', () => {
    expect(canOfferProjectCreate(makeUser({ is_staff: true }))).toBe(true);
  });

  it('returns true for an organization role that can create projects', () => {
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      role('CUSTOMER.OWNER', [PermissionEnum.CREATE_PROJECT]),
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
    expect(canOfferProjectCreate(user)).toBe(true);
  });

  it('returns false for an organization role that cannot create projects', () => {
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
    expect(canOfferProjectCreate(user)).toBe(false);
  });

  it('offers create to support who holds site-wide project create', () => {
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      role('GLOBAL.PROJECT_CREATOR', [PermissionEnum.CREATE_PROJECT]),
    ]);
    const user = makeUser({
      is_support: true,
      permissions: [
        {
          scope_type: 'global',
          scope_uuid: 'site',
          role_name: 'GLOBAL.PROJECT_CREATOR',
        } as Permission,
      ],
    });
    expect(canOfferProjectCreate(user)).toBe(true);
  });

  it('keeps a site-wide create grant hidden when no organization is visible', () => {
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      role('GLOBAL.PROJECT_CREATOR', [PermissionEnum.CREATE_PROJECT]),
    ]);
    const user = makeUser({
      permissions: [
        {
          scope_type: 'global',
          scope_uuid: 'site',
          role_name: 'GLOBAL.PROJECT_CREATOR',
        } as Permission,
      ],
    });
    expect(canOfferProjectCreate(user)).toBe(false);
  });

  it('offers create when a site-wide grant meets an organization the user can see', () => {
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      role('GLOBAL.PROJECT_CREATOR', [PermissionEnum.CREATE_PROJECT]),
      role('PROJECT.MEMBER', []),
    ]);
    const user = makeUser({
      permissions: [
        {
          scope_type: 'global',
          scope_uuid: 'site',
          role_name: 'GLOBAL.PROJECT_CREATOR',
        } as Permission,
        {
          scope_type: 'project',
          scope_uuid: 'project-1',
          customer_uuid: 'customer-1',
          role_name: 'PROJECT.MEMBER',
        } as Permission,
      ],
    });
    expect(canOfferProjectCreate(user)).toBe(true);
  });

  it('does not treat an unrelated grant as an organization the user can see', () => {
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      role('GLOBAL.PROJECT_CREATOR', [PermissionEnum.CREATE_PROJECT]),
      role('OFFERING.MANAGER', []),
    ]);
    const user = makeUser({
      permissions: [
        {
          scope_type: 'global',
          scope_uuid: 'site',
          role_name: 'GLOBAL.PROJECT_CREATOR',
        } as Permission,
        {
          scope_type: 'offering',
          scope_uuid: 'offering-1',
          customer_uuid: 'customer-1',
          role_name: 'OFFERING.MANAGER',
        } as Permission,
      ],
    });
    expect(canOfferProjectCreate(user)).toBe(false);
  });

  it('does not offer create to support without project create', () => {
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      role('GLOBAL.ORDERS', [PermissionEnum.LIST_ORDERS]),
    ]);
    const user = makeUser({
      is_support: true,
      permissions: [
        {
          scope_type: 'global',
          scope_uuid: 'site',
          role_name: 'GLOBAL.ORDERS',
        } as Permission,
      ],
    });
    expect(canOfferProjectCreate(user)).toBe(false);
  });
});
