import { isOwnerOrStaff, isManager, isAdmin } from './selectors';

describe('isOwnerOrStaff selector', () => {
  const staff = {
    is_staff: true,
    is_support: false,
    url: 'staff_url',
    uuid: 'staff_uuid',
  };

  const owner = {
    is_staff: false,
    is_support: false,
    url: 'owner_url',
    uuid: 'owner_uuid',
  };

  it('returns true if user is staff', () => {
    const workspace = { user: staff };
    const actual = isOwnerOrStaff({ workspace });
    expect(actual).toBe(true);
  });

  it('returns true if user is organization owner', () => {
    const workspace = {
      user: owner,
      customer: {
        name: 'Alice',
        url: 'url',
        uuid: 'uuid',
        owners: [owner],
      },
    };
    const actual = isOwnerOrStaff({ workspace });
    expect(actual).toBe(true);
  });

  it('returns false if user is not staff and is not organization owner', () => {
    const workspace = {
      user: owner,
      customer: {
        name: 'Alice',
        url: 'url',
        uuid: 'uuid',
        owners: [staff],
      },
    };
    const actual = isOwnerOrStaff({ workspace });
    expect(actual).toBe(false);
  });
});

describe('isManager selector', () => {
  it('should return true if project has a manager who is a current user', () => {
    const user = {
      is_staff: false,
      is_support: false,
      url: 'manager_url',
      uuid: 'manager_uuid',
    };
    const manager = {
      user_uuid: 'manager_uuid',
      role: 'manager',
    };
    const workspace = {
      user,
      project: {
        name: 'Project 1',
        url: 'url',
        uuid: 'uuid',
        permissions: [manager],
        quotas: [],
      },
    };
    const actual = isManager({ workspace });
    expect(actual).toBe(true);
  });
});

describe('isAdmin selector', () => {
  it('should return true if project has an admin who is a current user', () => {
    const user = {
      is_staff: false,
      is_support: false,
      url: 'admin_url',
      uuid: 'admin_uuid',
    };
    const admin = {
      user_uuid: 'admin_uuid',
      role: 'admin',
    };
    const workspace = {
      user,
      project: {
        name: 'Project 1',
        url: 'url',
        uuid: 'uuid',
        permissions: [admin],
        quotas: [],
      },
    };
    const actual = isAdmin({ workspace });
    expect(actual).toBe(true);
  });
});
