import { MenuItemType } from '@waldur/navigation/sidebar/types';
import { router } from '@waldur/router';
import { UsersService } from '@waldur/user/UsersService';
import { User } from '@waldur/workspace/types';

import { IssueNavigationService } from './IssueNavigationService';
jest.mock('@waldur/user/UsersService');
jest.mock('@waldur/router');
jest.mock('@waldur/features/connect', () => ({
  isFeatureVisible: () => true,
}));

const UsersServiceMock = UsersService as jest.Mocked<typeof UsersService>;

const hasState = (items: MenuItemType[], state: string) =>
  items.filter((item) => item.state === state).length >= 1;

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

  it('returns sidebar with helpdesk link if user is global support', async () => {
    UsersServiceMock.getCurrentUser.mockResolvedValue({
      is_support: true,
    } as User);
    const items = await IssueNavigationService.getSidebarItems();
    expect(hasState(items, 'support.helpdesk')).toBe(true);
  });

  it('returns sidebar with dashboard link if user is staff', async () => {
    UsersServiceMock.getCurrentUser.mockResolvedValue({
      is_staff: true,
    } as User);
    const items = await IssueNavigationService.getSidebarItems();
    expect(hasState(items, 'support.dashboard')).toBe(true);
  });

  it('returns sidebar with dashboard and helpdesk link if user is staff and support', async () => {
    UsersServiceMock.getCurrentUser.mockResolvedValue({
      is_staff: true,
      is_support: true,
    } as User);
    const items = await IssueNavigationService.getSidebarItems();
    expect(hasState(items, 'support.helpdesk')).toBe(true);
    expect(hasState(items, 'support.dashboard')).toBe(true);
  });
});
