import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { usersPartialUpdate } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { UserDeactivateDialog } from './UserDeactivateDialog';
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

  it('opens the deactivation dialog (with mandatory reason) when disabling a user', async () => {
    renderWithProviders(<UserStatus user={mockUser} />);

    await user.click(screen.getByLabelText('Active'));
    await waitFor(() => {
      expect(useModal().openDialog).toHaveBeenCalledWith(
        UserDeactivateDialog,
        expect.objectContaining({
          resolve: expect.objectContaining({ user: mockUser }),
        }),
      );
    });
    // Deactivation goes through the dialog, not a direct toggle.
    expect(usersPartialUpdate).not.toHaveBeenCalled();
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
