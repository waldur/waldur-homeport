import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usersPartialUpdate } from 'waldur-js-client';
import { User } from 'waldur-js-client';

import { useNotify } from '@/store/notify';

import { UserTokenLifetime } from './UserTokenLifetime';

vi.mock('@/store/notify');

vi.mock('waldur-js-client');

describe('UserTokenLifetime component', () => {
  const mockUser: User = {
    uuid: 'test-uuid',
    token_lifetime: 3600,
    token: 'test-token',
  } as any;

  let showErrorResponseMock;
  let showSuccessMock;

  beforeEach(() => {
    showErrorResponseMock = vi.fn();
    showSuccessMock = vi.fn();

    vi.mocked(useNotify).mockReturnValue({
      showErrorResponse: showErrorResponseMock,
      showSuccess: showSuccessMock,
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with initial values', () => {
    render(<UserTokenLifetime user={mockUser} />);

    // Check if the token is displayed as masked
    expect(screen.getByText(/\*\*\*\*\*\*/)).toBeInTheDocument();

    // Verify that the initial token lifetime value is selected
    expect(screen.getByText('1 hour')).toBeInTheDocument();
  });

  it('shows warning when "token will not timeout" option is selected', async () => {
    render(<UserTokenLifetime user={mockUser} />);

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

    render(<UserTokenLifetime user={mockUser} />);

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
      expect(showSuccessMock).toHaveBeenCalledWith('User has been updated');
    });
  });

  it('shows error message when API call fails', async () => {
    vi.mocked(usersPartialUpdate).mockRejectedValue(new Error('API error'));

    render(<UserTokenLifetime user={mockUser} />);
    await userEvent.click(
      screen.getByRole('button', { name: /Save changes/i }),
    );

    await waitFor(() => {
      expect(showErrorResponseMock).toHaveBeenCalledWith(
        expect.any(Error),
        'User could not be updated',
      );
    });
  });
});
