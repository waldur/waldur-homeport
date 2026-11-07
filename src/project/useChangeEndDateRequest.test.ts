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

// A user holding one role on one scope, the role granting `permissions`.
const userWithRole = (
  scope_type: string,
  scope_uuid: string,
  permissions: string[],
) => {
  vi.spyOn(ENV, 'roles', 'get').mockReturnValue([role('ROLE', permissions)]);
  return makeUser({
    permissions: [{ scope_type, scope_uuid, role_name: 'ROLE' } as Permission],
  });
};

const REQUEST = PermissionEnum.REQUEST_PROJECT_END_DATE_CHANGE;
const SET = PermissionEnum.SET_PROJECT_END_DATE;

describe('canRequestProjectEndDateChange', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns false when there is no user', () => {
    expect(canRequestProjectEndDateChange(null, PROJECT)).toBe(false);
  });

  it('returns false for staff, who set the date directly', () => {
    expect(
      canRequestProjectEndDateChange(makeUser({ is_staff: true }), PROJECT),
    ).toBe(false);
  });

  it('returns true for a project role that may ask for a change', () => {
    const user = userWithRole('project', 'project-1', [REQUEST]);
    expect(canRequestProjectEndDateChange(user, PROJECT)).toBe(true);
  });

  it('returns false for a project role that may not ask', () => {
    const user = userWithRole('project', 'project-1', [
      PermissionEnum.LIST_PROJECTS,
    ]);
    expect(canRequestProjectEndDateChange(user, PROJECT)).toBe(false);
  });

  it('returns false for a project role that sets the date itself', () => {
    const user = userWithRole('project', 'project-1', [REQUEST, SET]);
    expect(canRequestProjectEndDateChange(user, PROJECT)).toBe(false);
  });

  it('returns true for a site-wide role that may ask', () => {
    const user = userWithRole('global', 'site', [REQUEST]);
    expect(canRequestProjectEndDateChange(user, PROJECT)).toBe(true);
  });

  it('returns false for a site-wide role that sets the date itself', () => {
    const user = userWithRole('global', 'site', [REQUEST, SET]);
    expect(canRequestProjectEndDateChange(user, PROJECT)).toBe(false);
  });

  it('offers the request to an organization role that may ask', () => {
    const user = userWithRole('customer', 'customer-1', [REQUEST]);
    expect(canRequestProjectEndDateChange(user, PROJECT)).toBe(true);
  });

  it('returns false for an organization role that sets the date itself', () => {
    const user = userWithRole('customer', 'customer-1', [REQUEST, SET]);
    expect(canRequestProjectEndDateChange(user, PROJECT)).toBe(false);
  });

  it('returns false for a role on a different organization', () => {
    const user = userWithRole('customer', 'customer-2', [REQUEST]);
    expect(canRequestProjectEndDateChange(user, PROJECT)).toBe(false);
  });
});
