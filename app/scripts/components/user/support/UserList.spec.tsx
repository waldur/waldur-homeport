import { formatRoleFilter } from './UserList';

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

describe('formatRoleFilter', () => {
  it('should return format of filter compatible with api', () => {
    const expected = {
      is_staff: true,
      is_support: true,
    };
    expect(formatRoleFilter(filterMock)).toEqual(expected);
  });
});
