import {
  ordinaryUser,
  staffUser,
  supportAndStaffUser,
  supportUser,
  userWithFacebookId,
} from '@waldur/user/support/fixtures';
import {
  formatLifetime,
  formatRegistrationMethod,
  formatUserStatus,
} from '@waldur/user/support/utils';

describe('Utils functions', () => {
  it('should return appropriate user status', () => {
    expect(formatUserStatus(staffUser)).toEqual('Staff');
    expect(formatUserStatus(supportUser)).toEqual('Support user');
    expect(formatUserStatus(supportAndStaffUser)).toEqual(
      'Staff and Support user',
    );
    expect(formatUserStatus(ordinaryUser)).toEqual('Regular user');
  });

  it('should return appropriate registration method', () => {
    expect(formatRegistrationMethod(ordinaryUser)).toEqual('Default');
    expect(formatRegistrationMethod(userWithFacebookId)).toEqual('Facebook');
  });

  it('should return appropriate time format', () => {
    expect(formatLifetime(3600)).toEqual('1 h');
    expect(formatLifetime(3660)).toEqual('1 h 1 min');
    expect(formatLifetime(3000)).toEqual('50 min');
    expect(formatLifetime(15)).toEqual('15 sec');
    expect(formatLifetime(15)).toEqual('15 sec');
    expect(formatLifetime(0)).toEqual('token will not timeout');
    expect(formatLifetime(null)).toEqual('token will not timeout');
  });
});
