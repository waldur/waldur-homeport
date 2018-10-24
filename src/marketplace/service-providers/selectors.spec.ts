import { staff, user } from '@waldur/customer/create/fixtures';

import { renderServiceProvider } from './selectors';

describe('renderServiceProvider', () => {
  it('should return false if serviceProvider feature is disabled', () => {
    const state = {
      config: {
        disabledFeatures: {
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
        disabledFeatures: {
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
