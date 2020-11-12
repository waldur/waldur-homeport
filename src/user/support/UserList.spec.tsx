import {
  CUSTOMER_OWNER_ROLE,
  PROJECT_ADMIN_ROLE,
} from '@waldur/core/constants';

import { formatRoleFilter, getOrganizationsWhereOwner } from './UserList';

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

const customerPermissionsMock = [
  {
    customer_uuid: 'f80e006b36b542578fc216d83f2031fa',
    customer_name: 'Blackberry',
    role: CUSTOMER_OWNER_ROLE,
  },
  {
    customer_uuid: 'gh0e006b36b5425bhfc216d83f2031nh',
    customer_name: 'Tomson',
    role: CUSTOMER_OWNER_ROLE,
  },
  {
    customer_uuid: '560e006b36b542578fc216d83f2031bn',
    customer_name: 'Beeline',
    role: PROJECT_ADMIN_ROLE,
  },
];

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
    const actual = getOrganizationsWhereOwner(customerPermissionsMock);
    const expected = 'Blackberry, Tomson';
    expect(actual).toEqual(expected);
  });
});
