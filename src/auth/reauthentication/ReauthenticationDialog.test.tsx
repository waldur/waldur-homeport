import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';
import {
  completeReauthentication,
  isPasskeySupported,
  prepareReauthentication,
} from '@/user/passkeys/api';

import { reauthenticateWithPassword } from './api';
import { ReauthenticationDialog } from './ReauthenticationDialog';

vi.mock('./api', () => ({ reauthenticateWithPassword: vi.fn() }));
vi.mock('@/user/passkeys/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/user/passkeys/api')>()),
  isPasskeySupported: vi.fn(),
  prepareReauthentication: vi.fn(),
  completeReauthentication: vi.fn(),
}));

const challenge = (methods: string[]) => ({
  action: 'token_lifetime',
  methods,
  detail: 'Confirm your identity to make this change.',
});

// The error the API client hands a caller: the body's fields, the body
// under `data`, and the response.
const apiError = (
  status: number,
  body: object,
  headers: Record<string, string> = {},
) => ({
  ...body,
  data: body,
  status,
  response: new Response(null, { status, headers }),
});

const PREPARED = { ceremony: 'c1', options: { challenge: 'x' } };

const renderDialog = (methods: string[]) => {
  const onConfirm = vi.fn();
  renderWithProviders(
    <ReauthenticationDialog
      challenge={challenge(methods)}
      onConfirm={onConfirm}
    />,
  );
  return onConfirm;
};

const submitPassword = async (password: string) => {
  await userEvent.type(screen.getByLabelText('Password'), password);
  await userEvent.click(screen.getByTestId('reauthentication-submit'));
};

describe('ReauthenticationDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isPasskeySupported).mockReturnValue(true);
    vi.mocked(prepareReauthentication).mockResolvedValue(PREPARED);
  });

  it('asks for the password and hands back the grant', async () => {
    vi.mocked(reauthenticateWithPassword).mockResolvedValue('the-grant');
    const onConfirm = renderDialog(['password']);

    expect(screen.getByText("Confirm it's you")).toBeVisible();
    expect(
      screen.getByText("To change the API token lifetime, confirm it's you."),
    ).toBeVisible();
    expect(screen.queryByTestId('reauthentication-passkey')).toBeNull();
    expect(prepareReauthentication).not.toHaveBeenCalled();

    await submitPassword('demo');

    expect(reauthenticateWithPassword).toHaveBeenCalledWith(
      'token_lifetime',
      'demo',
    );
    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith('the-grant'));
  });

  it('shows a wrong password in the dialog', async () => {
    vi.mocked(reauthenticateWithPassword).mockRejectedValue(
      apiError(400, { password: ['The password is incorrect.'] }),
    );
    const onConfirm = renderDialog(['password']);

    await submitPassword('wrong');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The password is incorrect.',
    );
    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('takes the lockout’s length from the body first', async () => {
    // What a cross-origin page gets: retry_after in the body, Retry-After
    // hidden. Where both are readable, the body wins.
    vi.mocked(reauthenticateWithPassword).mockRejectedValue(
      apiError(
        429,
        {
          detail:
            'Too many failed attempts to confirm your identity. Expected available in 600 seconds.',
          retry_after: 600,
        },
        { 'Retry-After': '30' },
      ),
    );
    renderDialog(['password']);

    await submitPassword('wrong');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Too many attempts. Try again in 10 minutes.',
    );
  });

  it('takes the lockout’s length from Retry-After without one in the body', async () => {
    vi.mocked(reauthenticateWithPassword).mockRejectedValue(
      apiError(
        429,
        { detail: 'Too many failed attempts to confirm your identity.' },
        { 'Retry-After': '45' },
      ),
    );
    renderDialog(['password']);

    await submitPassword('wrong');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Too many attempts. Try again in 45 seconds.',
    );
  });

  it('falls back to the API’s message when neither gives the wait', async () => {
    vi.mocked(reauthenticateWithPassword).mockRejectedValue(
      apiError(429, {
        detail:
          'Too many failed attempts to confirm your identity. Expected available in 600 seconds.',
      }),
    );
    renderDialog(['password']);

    await submitPassword('wrong');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Expected available in 600 seconds.',
    );
  });

  it('confirms with a passkey prepared before the click', async () => {
    vi.mocked(completeReauthentication).mockResolvedValue('passkey-grant');
    const onConfirm = renderDialog(['password', 'passkey']);

    expect(prepareReauthentication).toHaveBeenCalledWith('token_lifetime');
    // The button is drawn anew once the challenge is in: query it again.
    await waitFor(() =>
      expect(screen.getByTestId('reauthentication-passkey')).toBeEnabled(),
    );
    await userEvent.click(screen.getByTestId('reauthentication-passkey'));

    // The action given at begin is the one sent at finish: the API refuses
    // a ceremony finished for another action.
    expect(completeReauthentication).toHaveBeenCalledWith(
      'token_lifetime',
      PREPARED,
    );
    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith('passkey-grant'),
    );
  });

  it('lets the user ask again when the passkey challenge cannot be fetched', async () => {
    vi.mocked(prepareReauthentication)
      .mockRejectedValueOnce(
        apiError(429, {
          detail: 'Request was throttled. Expected available in 40 seconds.',
          retry_after: 40,
        }),
      )
      .mockResolvedValueOnce(PREPARED);
    renderDialog(['password', 'passkey']);

    // The wait shows, the password still works meanwhile, and the passkey
    // is not left disabled for good.
    expect(
      await screen.findByText('Too many attempts. Try again in 40 seconds.'),
    ).toBeVisible();
    expect(screen.getByLabelText('Password')).toBeEnabled();
    expect(screen.queryByTestId('reauthentication-passkey')).toBeNull();

    await userEvent.click(screen.getByTestId('reauthentication-passkey-retry'));

    expect(prepareReauthentication).toHaveBeenCalledTimes(2);
    await waitFor(() =>
      expect(screen.getByTestId('reauthentication-passkey')).toBeEnabled(),
    );
    expect(
      screen.queryByText('Too many attempts. Try again in 40 seconds.'),
    ).toBeNull();
  });

  it('fetches a new passkey challenge after a refused prompt', async () => {
    vi.mocked(completeReauthentication).mockRejectedValueOnce(
      new DOMException('The operation was refused.', 'NotAllowedError'),
    );
    renderDialog(['passkey']);
    await waitFor(() =>
      expect(screen.getByTestId('reauthentication-passkey')).toBeEnabled(),
    );

    await userEvent.click(screen.getByTestId('reauthentication-passkey'));

    expect(
      await screen.findByText('Passkey verification failed'),
    ).toBeVisible();
    // Asking for a re-authentication challenge needs no grant, so this one
    // is fetched by itself, for the same action.
    await waitFor(() =>
      expect(prepareReauthentication).toHaveBeenCalledTimes(2),
    );
    expect(prepareReauthentication).toHaveBeenLastCalledWith('token_lifetime');
    await waitFor(() =>
      expect(screen.getByTestId('reauthentication-passkey')).toBeEnabled(),
    );
  });

  it('offers only the passkey when the account has no password', async () => {
    renderDialog(['passkey']);

    expect(screen.queryByLabelText('Password')).toBeNull();
    expect(screen.queryByTestId('reauthentication-submit')).toBeNull();
    await waitFor(() =>
      expect(screen.getByTestId('reauthentication-passkey')).toBeEnabled(),
    );
  });

  it('points to support when the API offers only methods the portal lacks', () => {
    renderDialog(['oidc']);

    expect(
      screen.getByText('Your account cannot confirm it is you'),
    ).toBeVisible();
    expect(screen.queryByLabelText('Password')).toBeNull();
  });

  it('points to support when the account cannot confirm at all', () => {
    renderDialog([]);

    expect(
      screen.getByText('Your account cannot confirm it is you'),
    ).toBeVisible();
    expect(screen.queryByLabelText('Password')).toBeNull();
    expect(screen.queryByTestId('reauthentication-passkey')).toBeNull();
    expect(
      within(screen.getByTestId('modal-footer')).getByRole('button', {
        name: 'Close',
      }),
    ).toBeVisible();
  });
});
