import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { keysCreate } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { KeyCreateDialog } from './KeyCreateDialog';

describe('KeyCreateDialog', () => {
  const user = userEvent.setup();
  const mockRefetch = vi.fn();
  const handleUnhandledRejection = () => {};

  beforeAll(() => process.on('unhandledRejection', handleUnhandledRejection));
  afterAll(() => process.off('unhandledRejection', handleUnhandledRejection));

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset ENV values to defaults to avoid bleeding state between tests
    ENV.plugins.WALDUR_CORE.SSH_KEY_ALLOWED_TYPES = [];
    ENV.plugins.WALDUR_CORE.SSH_KEY_MIN_RSA_KEY_SIZE = 0;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dialog with input fields', () => {
    renderWithProviders(<KeyCreateDialog refetch={mockRefetch} />);

    expect(screen.getByText('Import public key')).toBeInTheDocument();
    expect(screen.getByLabelText(/Key name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Public key/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Import key/i }),
    ).toBeInTheDocument();
  });

  it('shows no SSH key restriction banner when no restrictions are set', () => {
    renderWithProviders(<KeyCreateDialog refetch={mockRefetch} />);
    expect(screen.queryByText(/Allowed key types/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Minimum RSA key size/i)).not.toBeInTheDocument();
  });

  it('shows restrictions in the banner when configured in ENV', () => {
    ENV.plugins.WALDUR_CORE.SSH_KEY_ALLOWED_TYPES = ['ssh-rsa', 'ssh-ed25519'];
    ENV.plugins.WALDUR_CORE.SSH_KEY_MIN_RSA_KEY_SIZE = 2048;

    renderWithProviders(<KeyCreateDialog refetch={mockRefetch} />);

    expect(
      screen.getByText(/Allowed key types: ssh-rsa, ssh-ed25519/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Minimum RSA key size: 2048 bits/i),
    ).toBeInTheDocument();
  });

  it('submits the form successfully with manually entered name', async () => {
    vi.mocked(keysCreate).mockResolvedValueOnce({
      data: { name: 'my-key' },
    } as any);

    renderWithProviders(<KeyCreateDialog refetch={mockRefetch} />);

    await user.type(screen.getByLabelText(/Key name/i), 'my-key');
    await user.type(
      screen.getByLabelText(/Public key/i),
      'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD',
    );

    await user.click(screen.getByRole('button', { name: /Import key/i }));

    await waitFor(() => {
      expect(keysCreate).toHaveBeenCalledWith({
        body: {
          name: 'my-key',
          public_key: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD',
        },
      });
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'The key has been created.',
      );
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('submits the form extracting name from the public key comment when name is omitted', async () => {
    vi.mocked(keysCreate).mockResolvedValueOnce({
      data: { name: 'work-laptop' },
    } as any);

    renderWithProviders(<KeyCreateDialog refetch={mockRefetch} />);

    await user.type(
      screen.getByLabelText(/Public key/i),
      'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD work-laptop',
    );

    await user.click(screen.getByRole('button', { name: /Import key/i }));

    await waitFor(() => {
      expect(keysCreate).toHaveBeenCalledWith({
        body: {
          name: 'work-laptop',
          public_key: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD work-laptop',
        },
      });
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'The key has been created.',
      );
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('shows error notification when API call fails', async () => {
    vi.mocked(keysCreate).mockRejectedValueOnce(new Error('API Error'));

    renderWithProviders(<KeyCreateDialog refetch={mockRefetch} />);

    await user.type(screen.getByLabelText(/Key name/i), 'my-key');
    await user.type(
      screen.getByLabelText(/Public key/i),
      'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD',
    );

    await user.click(screen.getByRole('button', { name: /Import key/i }));

    await waitFor(() => {
      expect(keysCreate).toHaveBeenCalled();
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        expect.any(Error),
        'Unable to create key.',
      );
    });
  });
});
