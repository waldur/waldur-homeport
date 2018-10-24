import { user, staff } from './fixtures';
import { renderCustomerCreatePrompt } from './selectors';

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
