import { RoleEnum } from '@waldur/permissions/enums';

import { formatRoleFilter, getOrganizationsWhereOwner } from './UserList';

jest.mock('@waldur/core/filters', () => ({
  getInitialValues: jest.fn().mockImplementation((arg) => arg),
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
    expect(formatRoleFilter(filterMock)).toEqual(expected);
  });
});

describe('getOrganizationsWhereOwner', () => {
  it('should return joint list of organizations where user is an owner', () => {
    const actual = getOrganizationsWhereOwner(user);
    const expected = 'Blackberry, Tomson';
    expect(actual).toEqual(expected);
  });
});
