import { renderCustomerCreatePrompt, renderServiceProvider } from './selectors';

const user = {
  uuid: 'uuid',
  name: 'User',
  customer_permissions: [],
};

const staff = {
  uuid: 'uuid',
  name: 'Staff',
  is_staff: true,
  customer_permissions: [],
};

describe('renderCustomerCreatePrompt', () => {
  it('should return true if user is staff and has no customer permissions regardless config for an owner', () => {
    const state = {
      config: {
        ownerCanManageCustomer: false,
      },
      workspace: {
        user: staff,
      },
    };
    expect(renderCustomerCreatePrompt(state)).toEqual(true);
  });

  it('should return true if any user with no customer permissions and -ownerCanManageCustomer- is enabled in config', () => {
    const state = {
      config: {
        ownerCanManageCustomer: true,
      },
      workspace: {
        user,
      },
    };
    expect(renderCustomerCreatePrompt(state)).toEqual(true);
  });

  it('should return false if any user with no customer permissions but -ownerCanManageCustomer- is disabled in config', () => {
    const state = {
      config: {
        ownerCanManageCustomer: false,
      },
      workspace: {
        user,
      },
    };
    expect(renderCustomerCreatePrompt(state)).toEqual(false);
  });
});

describe('renderServiceProvider', () => {
  it('should return false if serviceProvider feature is disabled', () => {
    const state = {
      config: {
        features: {
          marketplace: true,
        },
        plugins: {
          WALDUR_MARKETPLACE: {
            OWNER_CAN_REGISTER_SERVICE_PROVIDER: false,
          },
        },
      },
      workspace: {
        user,
      },
    };
    expect(renderServiceProvider(state)).toEqual(false);
  });

  it('should return false if serviceProvider feature is disabled even if user is staff', () => {
    const state = {
      config: {
        features: {
          marketplace: true,
        },
        plugins: {
          WALDUR_MARKETPLACE: {
            OWNER_CAN_REGISTER_SERVICE_PROVIDER: false,
          },
        },
      },
      workspace: {
        user: staff,
      },
    };
    expect(renderServiceProvider(state)).toEqual(false);
  });

  it('should return true if serviceProvider feature is enabled and user is staff', () => {
    const state = {
      config: {
        featuresVisible: true,
        plugins: {
          WALDUR_MARKETPLACE: {
            OWNER_CAN_REGISTER_SERVICE_PROVIDER: false,
          },
        },
      },
      workspace: {
        user: staff,
      },
    };
    expect(renderServiceProvider(state)).toEqual(true);
  });

  it('should return false if -OWNER_CAN_REGISTER_SERVICE_PROVIDER- is false and user is not staff', () => {
    const state = {
      config: {
        featuresVisible: true,
        plugins: {
          WALDUR_MARKETPLACE: {
            OWNER_CAN_REGISTER_SERVICE_PROVIDER: false,
          },
        },
      },
      workspace: {
        user,
      },
    };
    expect(renderServiceProvider(state)).toEqual(false);
  });
});
