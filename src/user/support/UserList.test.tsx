import { vi, describe, it, expect } from 'vitest';

import { RoleEnum } from '@/permissions/enums';

import { formatRoleFilter, getOrganizationsWhereOwner } from './UserList';

vi.mock('@/core/filters', () => ({
  getInitialValues: vi.fn().mockImplementation((arg) => arg),
  syncFiltersToURL: vi.fn(),
}));

const filterMock = {
  role: [
    {
      name: 'Staff',
      value: 'is_staff',
    },
    {
      name: 'Support',
      value: 'is_support',
    },
  ],
};

const user: any = {
  permissions: [
    {
      scope_uuid: 'f80e006b36b542578fc216d83f2031fa',
      scope_type: 'customer',
      scope_name: 'Blackberry',
      role_name: RoleEnum.CUSTOMER_OWNER,
    },
    {
      scope_uuid: 'gh0e006b36b5425bhfc216d83f2031nh',
      scope_type: 'customer',
      scope_name: 'Tomson',
      role_name: RoleEnum.CUSTOMER_OWNER,
    },
    {
      scope_uuid: '560e006b36b542578fc216d83f2031bn',
      scope_type: 'project',
      scope_name: 'Beeline',
      role_name: RoleEnum.PROJECT_ADMIN,
    },
  ],
};

describe('formatRoleFilter', () => {
  it('should return format of filter compatible with api', () => {
    const expected = {
      is_staff: true,
      is_support: true,
    };
    expect(formatRoleFilter(filterMock.role)).toEqual(expected);
  });

  it('should return an empty object for non-array values (e.g. a malformed URL param)', () => {
    // A hand-edited URL can make the role filter any string; it must not crash.
    expect(formatRoleFilter('{broken-json')).toEqual({});
    expect(formatRoleFilter(undefined)).toEqual({});
    expect(formatRoleFilter(null)).toEqual({});
  });
});

describe('getOrganizationsWhereOwner', () => {
  it('should return joint list of organizations where user is an owner', () => {
    const actual = getOrganizationsWhereOwner(user);
    const expected = 'Blackberry, Tomson';
    expect(actual).toEqual(expected);
  });
});
