import { staff, user } from '@waldur/customer/create/fixtures';
import { RootState } from '@waldur/store/reducers';

import { renderServiceProvider } from './selectors';

describe('renderServiceProvider', () => {
  it('should return true if user is staff', () => {
    const state = {
      config: {
        plugins: {
          WALDUR_MARKETPLACE: {
            OWNER_CAN_REGISTER_SERVICE_PROVIDER: false,
          },
        },
      },
      workspace: {
        user: staff,
      },
    } as unknown as RootState;
    expect(renderServiceProvider(state)).toEqual(true);
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
    } as unknown as RootState;
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
    } as unknown as RootState;
    expect(renderServiceProvider(state)).toEqual(false);
  });
});
