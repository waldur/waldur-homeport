import { router } from '@waldur/router';
import { UsersService } from '@waldur/user/UsersService';
import { User } from '@waldur/workspace/types';

import { IssueNavigationService } from './IssueNavigationService';
jest.mock('@waldur/user/UsersService');
jest.mock('@waldur/router');
jest.mock('@waldur/configs/default', () => ({
  ENV: { plugins: { WALDUR_SUPPORT: { ENABLED: true }, FEATURES: {} } },
}));

jest.mock('@waldur/features/connect', () => ({
  isFeatureVisible: () => true,
}));

const UsersServiceMock = UsersService as jest.Mocked<typeof UsersService>;

describe('IssueNavigationService', () => {
  it('redirects to helpdesk if user is staff', async () => {
    UsersServiceMock.getCurrentUser.mockResolvedValue({
      is_staff: true,
    } as User);
    await IssueNavigationService.gotoDashboard();
    expect(router.stateService.go).toHaveBeenCalledWith('support.helpdesk');
  });

  it('redirects to helpdesk if user is global support', async () => {
    UsersServiceMock.getCurrentUser.mockResolvedValue({
      is_support: true,
    } as User);
    await IssueNavigationService.gotoDashboard();
    expect(router.stateService.go).toHaveBeenCalledWith('support.helpdesk');
  });

  it('redirects to dashboard if user is not support or staff', async () => {
    UsersServiceMock.getCurrentUser.mockResolvedValue({} as User);
    await IssueNavigationService.gotoDashboard();
    expect(router.stateService.go).toHaveBeenCalledWith('support.dashboard');
  });
});
