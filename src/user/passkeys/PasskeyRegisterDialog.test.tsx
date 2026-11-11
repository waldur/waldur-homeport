import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ReauthenticationCancelled } from '@/auth/reauthentication/api';
import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import {
  completeRegistration,
  isPasskeySupported,
  isPlatformAuthenticatorAvailable,
  prepareRegistration,
} from './api';
import { PasskeyRegisterDialog } from './PasskeyRegisterDialog';

vi.mock('./api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./api')>()),
  isPasskeySupported: vi.fn(),
  isPlatformAuthenticatorAvailable: vi.fn(),
  prepareRegistration: vi.fn(),
  completeRegistration: vi.fn(),
}));

const PREPARED = { ceremony: 'c1', options: { challenge: 'x' } };

// `@/modal/actions` and `@/store/notify` are mocked globally (test/mocks).
const renderDialog = () =>
  renderWithProviders(<PasskeyRegisterDialog resolve={{}} />);

const submitWithName = async () => {
  await userEvent.type(screen.getByLabelText(/Name/), 'Laptop');
  await waitFor(() =>
    expect(screen.getByTestId('passkey-register-submit')).toBeEnabled(),
  );
  await userEvent.click(screen.getByTestId('passkey-register-submit'));
};

describe('PasskeyRegisterDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isPasskeySupported).mockReturnValue(true);
    vi.mocked(isPlatformAuthenticatorAvailable).mockResolvedValue(true);
    vi.mocked(prepareRegistration).mockResolvedValue(PREPARED);
  });

  it('does not start another registration by itself after a dismissed prompt', async () => {
    // Starting one asks the user to confirm it is them: doing it unasked
    // would open "Confirm it's you" out of nowhere.
    vi.mocked(completeRegistration).mockRejectedValue(
      new DOMException('The operation was refused.', 'NotAllowedError'),
    );
    renderDialog();

    await submitWithName();

    expect(await screen.findByText('Passkey enrollment failed')).toBeVisible();
    expect(screen.getByTestId('passkey-register-retry')).toBeEnabled();
    expect(prepareRegistration).toHaveBeenCalledTimes(1);
  });

  it('starts again only when asked, and is not stuck when that is cancelled', async () => {
    vi.mocked(completeRegistration)
      .mockRejectedValueOnce(
        new DOMException('The operation was refused.', 'NotAllowedError'),
      )
      .mockResolvedValueOnce({} as any);
    renderDialog();
    await submitWithName();

    // The user asks again and then cancels "Confirm it's you".
    vi.mocked(prepareRegistration).mockRejectedValueOnce(
      new ReauthenticationCancelled(
        'Nothing was changed, because your identity was not confirmed.',
      ),
    );
    await userEvent.click(await screen.findByTestId('passkey-register-retry'));

    expect(
      await screen.findByText(
        'Nothing was changed, because your identity was not confirmed.',
      ),
    ).toBeVisible();
    expect(screen.getByTestId('passkey-register-retry')).toBeEnabled();
    expect(useModal().closeDialog).not.toHaveBeenCalled();

    // Asking again works.
    await userEvent.click(screen.getByTestId('passkey-register-retry'));
    await waitFor(() =>
      expect(screen.getByTestId('passkey-register-submit')).toBeEnabled(),
    );
    await userEvent.click(screen.getByTestId('passkey-register-submit'));

    await waitFor(() =>
      expect(completeRegistration).toHaveBeenLastCalledWith(PREPARED, 'Laptop'),
    );
    expect(prepareRegistration).toHaveBeenCalledTimes(3);
  });

  it('closes when the first registration cannot start', async () => {
    vi.mocked(prepareRegistration).mockRejectedValue(
      new ReauthenticationCancelled('Nothing was changed.'),
    );
    renderDialog();

    await waitFor(() => expect(useModal().closeDialog).toHaveBeenCalled());
  });
});
