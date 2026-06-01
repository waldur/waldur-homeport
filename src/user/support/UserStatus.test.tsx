import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { usersPartialUpdate } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { UserStatus } from './UserStatus';

describe('UserStatus', () => {
  const user = userEvent.setup();

  let mockUser;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = {
      uuid: 'abc123',
      full_name: 'John Doe',
      is_active: true,
    };
  });

  it('renders the component with the enabled user', () => {
    renderWithProviders(<UserStatus user={mockUser} />);
    expect(screen.getByText('Account status')).toBeInTheDocument();
    expect(screen.getByLabelText('Active')).toBeChecked();
  });

  it('deactivates user successfully', async () => {
    vi.mocked(useModal().confirm).mockResolvedValue(true);
    const { queryClient } = renderWithProviders(<UserStatus user={mockUser} />);
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData');

    await user.click(screen.getByLabelText('Active'));
    await waitFor(() => {
      expect(useModal().confirm).toHaveBeenCalled();
      expect(usersPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'abc123' },
        body: { is_active: false },
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['User', 'abc123'],
      });
      expect(setQueryDataSpy).toHaveBeenCalledWith(
        ['User', 'abc123'],
        expect.any(Function),
      );
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'User has been disabled.',
      );
    });
  });

  it('handles the error when deactivating user', async () => {
    vi.mocked(useModal().confirm).mockResolvedValue(true);
    vi.mocked(usersPartialUpdate).mockRejectedValue(new Error('Server error'));
    renderWithProviders(<UserStatus user={mockUser} />);
    await user.click(screen.getByLabelText('Active'));
    await waitFor(() => {
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        new Error('Server error'),
        'Unable to toggle user status.',
      );
    });
  });

  it('renders the component with the disabled user', () => {
    renderWithProviders(
      <UserStatus user={{ ...mockUser, is_active: false }} />,
    );
    expect(screen.getByText('Account status')).toBeInTheDocument();
    expect(screen.getByLabelText('Disabled')).not.toBeChecked();
  });

  it('activates user successfully', async () => {
    vi.mocked(useModal().confirm).mockResolvedValue(true);
    renderWithProviders(
      <UserStatus user={{ ...mockUser, is_active: false }} />,
    );
    await user.click(screen.getByLabelText('Disabled'));
    await waitFor(() => {
      expect(usersPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'abc123' },
        body: {
          is_active: true,
        },
      });
    });
  });
});
