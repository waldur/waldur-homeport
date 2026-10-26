import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { User, usersPartialUpdate } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';
import { getSelectByLabel, openAndSelectOption } from '@/test/select';
import { isImpersonating } from '@/user/termsGate';
import { useSetUser } from '@/workspace/hooks';

import { UserTokenLifetime } from './UserTokenLifetime';

vi.mock('@/user/termsGate', () => ({ isImpersonating: vi.fn(() => false) }));

const getLifetimeOptions = async () => {
  await userEvent.click(
    within(getSelectByLabel(/Token lifetime/i)).getByRole('combobox'),
  );
  const options = await screen.findAllByRole('option');
  return options.map((option) => option.textContent);
};

describe('UserTokenLifetime with a lifetime limit', () => {
  const user = {
    uuid: 'test-uuid',
    token_lifetime: 1800,
    token: 'test-token',
    is_staff: false,
  } as User;

  afterEach(() => {
    ENV.plugins.WALDUR_CORE.API_TOKEN_MAX_LIFETIME_MINUTES = undefined;
    vi.mocked(isImpersonating).mockReturnValue(false);
  });

  it('offers only the lifetimes within the limit', async () => {
    ENV.plugins.WALDUR_CORE.API_TOKEN_MAX_LIFETIME_MINUTES = 60;
    renderWithProviders(<UserTokenLifetime user={user} />);

    expect(await getLifetimeOptions()).toEqual([
      '10 minutes',
      '30 minutes',
      '1 hour',
    ]);
    expect(
      screen.getByText('The longest token lifetime you can choose is 1 hour.'),
    ).toBeInTheDocument();
  });

  it('offers the limit itself when it is not one of the presets', async () => {
    ENV.plugins.WALDUR_CORE.API_TOKEN_MAX_LIFETIME_MINUTES = 480;
    renderWithProviders(<UserTokenLifetime user={user} />);

    expect(await getLifetimeOptions()).toEqual([
      '10 minutes',
      '30 minutes',
      '1 hour',
      '2 hours',
      '8 hours',
    ]);
    expect(
      screen.getByText('The longest token lifetime you can choose is 8 hours.'),
    ).toBeInTheDocument();
  });

  it('keeps showing a lifetime chosen before the limit', async () => {
    ENV.plugins.WALDUR_CORE.API_TOKEN_MAX_LIFETIME_MINUTES = 60;
    renderWithProviders(
      <UserTokenLifetime user={{ ...user, token_lifetime: null }} />,
    );

    expect(screen.getByText('token will not timeout')).toBeInTheDocument();
    expect(await getLifetimeOptions()).toEqual([
      '10 minutes',
      '30 minutes',
      '1 hour',
      'token will not timeout',
    ]);
  });

  it('offers every lifetime to staff', async () => {
    ENV.plugins.WALDUR_CORE.API_TOKEN_MAX_LIFETIME_MINUTES = 60;
    renderWithProviders(
      <UserTokenLifetime user={{ ...user, is_staff: true }} />,
    );

    expect(await getLifetimeOptions()).toContain('token will not timeout');
    expect(
      screen.queryByText(/The longest token lifetime you can choose/),
    ).not.toBeInTheDocument();
  });

  it('offers every lifetime to staff impersonating the user', async () => {
    ENV.plugins.WALDUR_CORE.API_TOKEN_MAX_LIFETIME_MINUTES = 60;
    vi.mocked(isImpersonating).mockReturnValue(true);
    renderWithProviders(<UserTokenLifetime user={user} />);

    expect(await getLifetimeOptions()).toContain('token will not timeout');
  });

  it('shows a stored lifetime that is not one of the presets', async () => {
    ENV.plugins.WALDUR_CORE.API_TOKEN_MAX_LIFETIME_MINUTES = 30;
    renderWithProviders(
      <UserTokenLifetime user={{ ...user, token_lifetime: 2700 }} />,
    );

    expect(screen.getByText('45 minutes')).toBeInTheDocument();
    expect(await getLifetimeOptions()).toEqual([
      '10 minutes',
      '30 minutes',
      '45 minutes',
    ]);
  });

  it('treats a limit of zero or less as no limit', async () => {
    ENV.plugins.WALDUR_CORE.API_TOKEN_MAX_LIFETIME_MINUTES = -1;
    renderWithProviders(<UserTokenLifetime user={user} />);

    expect(await getLifetimeOptions()).toContain('token will not timeout');
    expect(
      screen.queryByText(/The longest token lifetime you can choose/),
    ).not.toBeInTheDocument();
  });
});

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
    const user = userEvent.setup();
    renderWithProviders(<UserTokenLifetime user={mockUser} />);

    // Open the select and choose the "no timeout" option
    await openAndSelectOption(
      user,
      /Token lifetime/i,
      /token will not timeout/i,
    );

    // Check if the warning message appears
    expect(
      screen.getByText(/By setting token lifetime to indefinite/i),
    ).toBeInTheDocument();
  });

  it('calls updateUser API on form submit with the correct payload', async () => {
    vi.mocked(usersPartialUpdate).mockResolvedValueOnce({
      data: mockUser,
    } as any);

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
      // The saved user replaces the current one, so the options follow it.
      expect(useSetUser()).toHaveBeenCalledWith(mockUser);
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
