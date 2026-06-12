import { describe, it, expect } from 'vitest';
import { Permission, User } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { PermissionEnum } from '@/permissions/enums';

ENV.roles = [
  {
    name: 'CUSTOMER.OWNER',
    permissions: [
      PermissionEnum.DELETE_CUSTOMER_PERMISSION,
      PermissionEnum.DELETE_RESOURCE_PERMISSION,
      PermissionEnum.DELETE_RESOURCE_PROJECT_PERMISSION,
      PermissionEnum.DELETE_PROJECT_PERMISSION,
    ],
  },
  {
    name: 'PROJECT.MANAGER',
    permissions: [
      PermissionEnum.DELETE_RESOURCE_PERMISSION,
      PermissionEnum.DELETE_RESOURCE_PROJECT_PERMISSION,
      PermissionEnum.DELETE_PROJECT_PERMISSION,
    ],
  },
  {
    name: 'PROJECT.MEMBER',
    permissions: [],
  },
] as any;

import { canDeletePermission } from './utils';

const buildUser = (overrides: Partial<User> = {}): User =>
  ({
    is_staff: false,
    permissions: [],
    ...overrides,
  }) as User;

const buildPerm = (overrides: Partial<Permission>): Permission =>
  ({
    user_uuid: 'user-1',
    scope_uuid: 'scope-1',
    customer_uuid: 'customer-1',
    role_name: 'PROJECT.MANAGER',
    ...overrides,
  }) as Permission;

describe('canDeletePermission', () => {
  it('returns true for staff regardless of scope', () => {
    const user = buildUser({ is_staff: true });
    const perm = buildPerm({ scope_type: 'resource' });
    expect(canDeletePermission(user, perm)).toBe(true);
  });

  it('returns true when user is project manager of the resource owning project', () => {
    const user = buildUser({
      permissions: [
        {
          scope_uuid: 'project-1',
          scope_type: 'project',
          role_name: 'PROJECT.MANAGER',
        } as any,
      ],
    });
    const perm = buildPerm({
      scope_type: 'resource',
      project_uuid: 'project-1',
    });
    expect(canDeletePermission(user, perm)).toBe(true);
  });

  it('returns true when user is project manager of the resource_project parent project', () => {
    const user = buildUser({
      permissions: [
        {
          scope_uuid: 'project-1',
          scope_type: 'project',
          role_name: 'PROJECT.MANAGER',
        } as any,
      ],
    });
    const perm = buildPerm({
      scope_type: 'resource_project',
      project_uuid: 'project-1',
    });
    expect(canDeletePermission(user, perm)).toBe(true);
  });

  it('returns true when user is project manager on a project-scoped permission row', () => {
    const user = buildUser({
      permissions: [
        {
          scope_uuid: 'project-1',
          scope_type: 'project',
          role_name: 'PROJECT.MANAGER',
        } as any,
      ],
    });
    const perm = buildPerm({
      scope_type: 'project',
      scope_uuid: 'project-1',
    });
    expect(canDeletePermission(user, perm)).toBe(true);
  });

  it('returns true when user is customer owner on a customer-scoped permission row', () => {
    const user = buildUser({
      permissions: [
        {
          scope_uuid: 'customer-1',
          scope_type: 'customer',
          role_name: 'CUSTOMER.OWNER',
        } as any,
      ],
    });
    const perm = buildPerm({
      scope_type: 'customer',
      scope_uuid: 'customer-1',
    });
    expect(canDeletePermission(user, perm)).toBe(true);
  });

  it('returns falsy when user has no relevant role on the resource project', () => {
    const user = buildUser({
      permissions: [
        {
          scope_uuid: 'other-project',
          scope_type: 'project',
          role_name: 'PROJECT.MANAGER',
        } as any,
      ],
    });
    const perm = buildPerm({
      scope_type: 'resource',
      project_uuid: 'project-1',
    });
    expect(canDeletePermission(user, perm)).toBeFalsy();
  });

  it('returns falsy when project role lacks the required permission', () => {
    const user = buildUser({
      permissions: [
        {
          scope_uuid: 'project-1',
          scope_type: 'project',
          role_name: 'PROJECT.MEMBER',
        } as any,
      ],
    });
    const perm = buildPerm({
      scope_type: 'resource',
      project_uuid: 'project-1',
    });
    expect(canDeletePermission(user, perm)).toBeFalsy();
  });

  it('returns falsy when backend omits project_uuid for a resource scope', () => {
    const user = buildUser({
      permissions: [
        {
          scope_uuid: 'project-1',
          scope_type: 'project',
          role_name: 'PROJECT.MANAGER',
        } as any,
      ],
    });
    const perm = buildPerm({
      scope_type: 'resource',
      project_uuid: undefined,
    });
    expect(canDeletePermission(user, perm)).toBeFalsy();
  });
});
