import { orderCanBeApproved } from './selectors';

const staff = {
  uuid: 'staff uuid',
  is_staff: true,
  is_support: false,
};

const user = {
  uuid: 'user_uuid',
  is_staff: false,
  is_support: false,
};

const admin = {
  user_uuid: 'user_uuid',
  role: 'admin',
};

const manager = {
  user_uuid: 'user_uuid',
  role: 'manager',
};

describe('orderCanBeApproved utility function', () => {
  it('should return true if user is staff', () => {
    const config = {
      plugins: {
        WALDUR_MARKETPLACE: {
          OWNER_CAN_APPROVE_ORDER: true,
          ADMIN_CAN_APPROVE_ORDER: true,
          MANAGER_CAN_APPROVE_ORDER: true,
        },
      },
    };
    const workspace = {
      user: staff,
    };
    expect(orderCanBeApproved({ config, workspace })).toEqual(true);
  });
  it('should return true if OWNER_CAN_APPROVE_ORDER and current user is owner', () => {
    const config = {
      plugins: {
        WALDUR_MARKETPLACE: {
          OWNER_CAN_APPROVE_ORDER: true,
          ADMIN_CAN_APPROVE_ORDER: false,
          MANAGER_CAN_APPROVE_ORDER: false,
        },
      },
    };
    const workspace = {
      user,
      customer: {
        name: 'Nomady',
        url: 'url',
        uuid: 'uuid',
        owners: [user],
      },
    };
    expect(orderCanBeApproved({ config, workspace })).toEqual(true);
  });
  it('should return false if OWNER_CAN_APPROVE_ORDER but current user is not the owner', () => {
    const config = {
      plugins: {
        WALDUR_MARKETPLACE: {
          OWNER_CAN_APPROVE_ORDER: true,
          ADMIN_CAN_APPROVE_ORDER: false,
          MANAGER_CAN_APPROVE_ORDER: false,
        },
      },
    };
    const workspace = {
      user,
      customer: {
        name: 'Nomady',
        url: 'url',
        uuid: 'uuid',
        owners: [],
      },
    };
    expect(orderCanBeApproved({ config, workspace })).toEqual(false);
  });
  it('should return false if OWNER_CAN_APPROVE_ORDER is equal to false but current user is the owner', () => {
    const config = {
      plugins: {
        WALDUR_MARKETPLACE: {
          OWNER_CAN_APPROVE_ORDER: false,
          ADMIN_CAN_APPROVE_ORDER: false,
          MANAGER_CAN_APPROVE_ORDER: false,
        },
      },
    };
    const workspace = {
      user,
      customer: {
        name: 'Nomady',
        url: 'url',
        uuid: 'uuid',
        owners: [user],
      },
    };
    expect(orderCanBeApproved({ config, workspace })).toEqual(false);
  });
  it('should return true if ADMIN_CAN_APPROVE_ORDER and current user is the admin', () => {
    const config = {
      plugins: {
        WALDUR_MARKETPLACE: {
          OWNER_CAN_APPROVE_ORDER: false,
          ADMIN_CAN_APPROVE_ORDER: true,
          MANAGER_CAN_APPROVE_ORDER: false,
        },
      },
    };
    const workspace = {
      user,
      project: {
        name: 'Nomady',
        url: 'url',
        uuid: 'uuid',
        permissions: [admin],
      },
    };
    expect(orderCanBeApproved({ config, workspace })).toEqual(true);
  });
  it('should return false if ADMIN_CAN_APPROVE_ORDER is equal to false but current user is the admin', () => {
    const config = {
      plugins: {
        WALDUR_MARKETPLACE: {
          OWNER_CAN_APPROVE_ORDER: false,
          ADMIN_CAN_APPROVE_ORDER: false,
          MANAGER_CAN_APPROVE_ORDER: false,
        },
      },
    };
    const workspace = {
      user,
      project: {
        name: 'Nomady',
        url: 'url',
        uuid: 'uuid',
        permissions: [admin],
      },
    };
    expect(orderCanBeApproved({ config, workspace })).toEqual(false);
  });
  it('should return false if ADMIN_CAN_APPROVE_ORDER but current user is not the admin', () => {
    const config = {
      plugins: {
        WALDUR_MARKETPLACE: {
          OWNER_CAN_APPROVE_ORDER: false,
          ADMIN_CAN_APPROVE_ORDER: false,
          MANAGER_CAN_APPROVE_ORDER: false,
        },
      },
    };
    const workspace = {
      user,
      project: {
        name: 'Nomady',
        url: 'url',
        uuid: 'uuid',
        permissions: [],
      },
    };
    expect(orderCanBeApproved({ config, workspace })).toEqual(false);
  });
  it('should return true if MANAGER_CAN_APPROVE_ORDER and current user is the manager', () => {
    const config = {
      plugins: {
        WALDUR_MARKETPLACE: {
          OWNER_CAN_APPROVE_ORDER: false,
          ADMIN_CAN_APPROVE_ORDER: false,
          MANAGER_CAN_APPROVE_ORDER: true,
        },
      },
    };
    const workspace = {
      user,
      project: {
        name: 'Nomady',
        url: 'url',
        uuid: 'uuid',
        permissions: [manager],
      },
    };
    expect(orderCanBeApproved({ config, workspace })).toEqual(true);
  });
  it('should return false if MANAGER_CAN_APPROVE_ORDER is equal to false but current user is the manager', () => {
    const config = {
      plugins: {
        WALDUR_MARKETPLACE: {
          OWNER_CAN_APPROVE_ORDER: false,
          ADMIN_CAN_APPROVE_ORDER: false,
          MANAGER_CAN_APPROVE_ORDER: false,
        },
      },
    };
    const workspace = {
      user,
      project: {
        name: 'Nomady',
        url: 'url',
        uuid: 'uuid',
        permissions: [manager],
      },
    };
    expect(orderCanBeApproved({ config, workspace })).toEqual(false);
  });
  it('should return false if MANAGER_CAN_APPROVE_ORDER but current user is not the manager', () => {
    const config = {
      plugins: {
        WALDUR_MARKETPLACE: {
          OWNER_CAN_APPROVE_ORDER: false,
          ADMIN_CAN_APPROVE_ORDER: false,
          MANAGER_CAN_APPROVE_ORDER: true,
        },
      },
    };
    const workspace = {
      user,
      project: {
        name: 'Nomady',
        url: 'url',
        uuid: 'uuid',
        permissions: [],
      },
    };
    expect(orderCanBeApproved({ config, workspace })).toEqual(false);
  });
});
