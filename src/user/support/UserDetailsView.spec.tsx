import {
  ordinaryUser,
  staffUser,
  supportUser,
} from '@waldur/user/support/fixtures';

import { userManageIsVisible, isVisibleForSupportOrStaff } from './selectors';

const createState = user => ({
  workspace: {
    user,
  },
  config: {
    featuresVisible: true,
  },
});

describe('UserDetailsView', () => {
  it('should conceal "Manage" tab for support user', () => {
    const state = createState(supportUser);
    expect(userManageIsVisible(state)).toBe(false);
  });

  it('should conceal "Manage" tab for ordinary user', () => {
    const state = createState(ordinaryUser);
    expect(userManageIsVisible(state)).toBe(false);
  });

  it('should conceal "Details" tab for ordinary user', () => {
    const state = createState(ordinaryUser);
    expect(isVisibleForSupportOrStaff(state)).toBe(false);
  });

  it('should display "Manage" tab for staff user', () => {
    const state = createState(staffUser);
    expect(userManageIsVisible(state)).toBe(true);
  });
});
