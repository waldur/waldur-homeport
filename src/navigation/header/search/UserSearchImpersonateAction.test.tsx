import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useModal } from '@/modal/actions';
import { router as globalRouter } from '@/router';
import { renderWithProviders } from '@/test/harness';
import { useImpersonate } from '@/user/support/useImpersonate';
import { useUser } from '@/workspace/hooks';

import { UserSearchImpersonateAction } from './UserSearchImpersonateAction';

vi.mock('@/user/support/useImpersonate');

describe('UserSearchImpersonateAction', () => {
  const user = userEvent.setup();

  const staffUser = { uuid: 'staff-uuid', is_staff: true };
  const row = {
    uuid: 'target-uuid',
    full_name: 'Target User',
    email: 'target@example.com',
    has_active_session: true,
  };

  const mockImpersonate = vi.fn();
  const mockClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue(staffUser as any);
    vi.mocked(useRouter).mockReturnValue(globalRouter as any);
    vi.mocked(useImpersonate).mockReturnValue({
      impersonate: mockImpersonate,
      isPending: false,
    } as any);
  });

  const renderComponent = (rowOverrides = {}) =>
    renderWithProviders(
      <UserSearchImpersonateAction
        row={{ ...row, ...rowOverrides }}
        close={mockClose}
      />,
    );

  it('closes search before confirming, then impersonates and navigates', async () => {
    vi.mocked(useModal().confirm).mockResolvedValueOnce(null);
    mockImpersonate.mockResolvedValueOnce(undefined);

    renderComponent();
    await user.click(screen.getByRole('button', { name: 'Impersonate' }));

    await waitFor(() => {
      expect(mockClose).toHaveBeenCalled();
      expect(useModal().confirm).toHaveBeenCalled();
      expect(mockImpersonate).toHaveBeenCalled();
      expect(globalRouter.stateService.go).toHaveBeenCalledWith(
        'profile.details',
      );
    });
  });

  it('closes search but does not impersonate when confirmation is dismissed', async () => {
    vi.mocked(useModal().confirm).mockRejectedValueOnce(null);

    renderComponent();
    await user.click(screen.getByRole('button', { name: 'Impersonate' }));

    await waitFor(() => {
      expect(mockClose).toHaveBeenCalled();
      expect(useModal().confirm).toHaveBeenCalled();
    });
    expect(mockImpersonate).not.toHaveBeenCalled();
    expect(globalRouter.stateService.go).not.toHaveBeenCalled();
  });

  it('is hidden for non-staff users', () => {
    vi.mocked(useUser).mockReturnValue({
      uuid: 'support-uuid',
      is_staff: false,
      is_support: true,
    } as any);

    renderComponent();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('is hidden for the current user own row', () => {
    renderComponent({ uuid: 'staff-uuid' });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('is hidden when the target user has no active session', () => {
    renderComponent({ has_active_session: false });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
