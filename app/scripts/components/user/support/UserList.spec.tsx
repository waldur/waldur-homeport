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
    role: 'owner',
  },
  {
    customer_uuid: 'gh0e006b36b5425bhfc216d83f2031nh',
    customer_name: 'Tomson',
    role: 'owner',
  },
  {
    customer_uuid: '560e006b36b542578fc216d83f2031bn',
    customer_name: 'Beeline',
    role: 'admin',
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
