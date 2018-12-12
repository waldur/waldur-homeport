import { user, staff } from './fixtures';
import { renderCustomerCreatePrompt } from './selectors';

const check = (param, currentUser) =>
  renderCustomerCreatePrompt({
    config: {
      plugins: {
        WALDUR_CORE: {
          OWNER_CAN_MANAGE_CUSTOMER: param,
        },
      },
    },
    workspace: {
      user: currentUser,
    },
  });

describe('renderCustomerCreatePrompt', () => {
  it('should return true if user is staff', () => {
    expect(check(false, staff)).toEqual(true);
  });

  it('should return true if feature is enabled', () => {
    expect(check(true, user)).toEqual(true);
  });

  it('should return false if feature is disabled', () => {
    expect(check(false, user)).toEqual(false);
  });
});
