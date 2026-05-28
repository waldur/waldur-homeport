import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { User, usersPartialUpdate } from 'waldur-js-client';

import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { UserTokenLifetime } from './UserTokenLifetime';

describe('UserTokenLifetime component', () => {
  const mockUser: User = {
    uuid: 'test-uuid',
    token_lifetime: 3600,
    token: 'test-token',
  } as any;

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with initial values', () => {
    renderWithProviders(<UserTokenLifetime user={mockUser} />);

    // Check if the token is displayed as masked
    expect(screen.getByText('••••••••••••')).toBeInTheDocument();

    // Verify that the initial token lifetime value is selected
    expect(screen.getByText('1 hour')).toBeInTheDocument();
  });

  it('shows warning when "token will not timeout" option is selected', async () => {
    renderWithProviders(<UserTokenLifetime user={mockUser} />);

    // Open the select and choose the "no timeout" option
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByText(/token will not timeout/i));

    // Check if the warning message appears
    expect(
      screen.getByText(/By setting token lifetime to indefinite/i),
    ).toBeInTheDocument();
  });

  it('calls updateUser API on form submit with the correct payload', async () => {
    vi.mocked(usersPartialUpdate).mockResolvedValueOnce(null);

    renderWithProviders(<UserTokenLifetime user={mockUser} />);

    // Trigger the submit
    await userEvent.click(
      screen.getByRole('button', { name: /Save changes/i }),
    );

    await waitFor(() => {
      expect(usersPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: mockUser.uuid },
        body: {
          token_lifetime: 3600,
        },
      });
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'User has been updated',
      );
    });
  });

  it('shows error message when API call fails', async () => {
    vi.mocked(usersPartialUpdate).mockRejectedValue(new Error('API error'));

    renderWithProviders(<UserTokenLifetime user={mockUser} />);
    await userEvent.click(
      screen.getByRole('button', { name: /Save changes/i }),
    );

    await waitFor(() => {
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        expect.any(Error),
        'User could not be updated',
      );
    });
  });
});
