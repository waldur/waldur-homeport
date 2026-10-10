import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { CryptoConflict, CryptoSessionEnded, WrongRecoveryKey } from './crypto';
import { MatrixEncryptionNotice } from './MatrixEncryptionNotice';
import { MatrixRecoveryKeyDialog } from './MatrixRecoveryKeyDialog';
import { useMatrixClient } from './useMatrixClient';

vi.mock('./useMatrixClient', () => ({ useMatrixClient: vi.fn() }));

const KEY = 'EsTA XFpR o5XU SFgV';

const renderDialog = (importRecoveryKey = vi.fn()) => {
  renderWithProviders(
    <MatrixRecoveryKeyDialog resolve={{ importRecoveryKey }} />,
  );
  return importRecoveryKey;
};

describe('MatrixRecoveryKeyDialog', () => {
  afterEach(() => {
    vi.mocked(useModal().closeDialog).mockClear();
  });

  it('unlocks with the key the user enters, then closes', async () => {
    const user = userEvent.setup();
    const importRecoveryKey = renderDialog(
      vi.fn().mockResolvedValue(undefined),
    );

    await user.type(screen.getByLabelText('Recovery key'), KEY);
    await user.click(screen.getByRole('button', { name: 'Unlock' }));

    expect(importRecoveryKey).toHaveBeenCalledWith(KEY);
    await waitFor(() => expect(useModal().closeDialog).toHaveBeenCalled());
  });

  it('hides the key until shown, and can copy it', async () => {
    const user = userEvent.setup();
    renderDialog();
    // Showing and hiding may mount a new input, so it is looked up each time.
    const field = () => screen.getByLabelText('Recovery key');

    await user.type(field(), KEY);
    expect(field()).not.toHaveValue(KEY);

    await user.click(screen.getByRole('button', { name: 'Show' }));
    expect(field()).toHaveValue(KEY);
    await user.click(screen.getByRole('button', { name: 'Hide' }));
    expect(field()).not.toHaveValue(KEY);
    expect(
      screen.getByRole('button', { name: 'Copy to clipboard' }),
    ).toBeTruthy();
  });

  it('is never a password field', () => {
    renderDialog();

    expect(screen.getByLabelText('Recovery key')).toHaveAttribute(
      'type',
      'text',
    );
  });

  it('cannot be submitted empty', () => {
    renderDialog();

    expect(screen.getByRole('button', { name: 'Unlock' })).toBeDisabled();
  });

  it('says so when the key does not unlock, and stays open', async () => {
    const user = userEvent.setup();
    renderDialog(vi.fn().mockRejectedValue(new WrongRecoveryKey()));

    await user.type(screen.getByLabelText('Recovery key'), KEY);
    await user.click(screen.getByRole('button', { name: 'Unlock' }));

    expect(
      await screen.findByText(/does not unlock your chat encryption/),
    ).toBeTruthy();
    expect(useModal().closeDialog).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Unlock' })).toBeEnabled();
  });

  it('treats a key Waldur refused like a wrong key', async () => {
    const user = userEvent.setup();
    renderDialog(vi.fn().mockRejectedValue(new CryptoConflict('wrong_key')));

    await user.type(screen.getByLabelText('Recovery key'), KEY);
    await user.click(screen.getByRole('button', { name: 'Unlock' }));

    expect(
      await screen.findByText(/does not unlock your chat encryption/),
    ).toBeTruthy();
  });

  it('asks to reload when Waldur already holds a key that works', async () => {
    const user = userEvent.setup();
    renderDialog(vi.fn().mockRejectedValue(new CryptoConflict('not_locked')));

    await user.type(screen.getByLabelText('Recovery key'), KEY);
    await user.click(screen.getByRole('button', { name: 'Unlock' }));

    expect(await screen.findByText(/Reload the chat/)).toBeTruthy();
  });

  it('asks to wait while another window sets encryption up', async () => {
    const user = userEvent.setup();
    renderDialog(vi.fn().mockRejectedValue(new CryptoConflict('in_progress')));

    await user.type(screen.getByLabelText('Recovery key'), KEY);
    await user.click(screen.getByRole('button', { name: 'Unlock' }));

    expect(
      await screen.findByText(/being set up in another window/),
    ).toBeTruthy();
  });
});

describe('MatrixRecoveryKeyDialog when the session ended', () => {
  it('asks to open the chat again rather than to retry', async () => {
    const user = userEvent.setup();
    renderDialog(vi.fn().mockRejectedValue(new CryptoSessionEnded()));

    await user.type(screen.getByLabelText('Recovery key'), KEY);
    await user.click(screen.getByRole('button', { name: 'Unlock' }));

    expect(await screen.findByText(/open the chat again/)).toBeTruthy();
    expect(screen.queryByText(/try again/i)).toBeNull();
  });
});

describe('MatrixEncryptionNotice', () => {
  const context = (cryptoState: string) => ({
    cryptoState,
    resetCryptoIdentity: vi.fn(),
    importCryptoRecoveryKey: vi.fn(),
  });

  afterEach(() => {
    vi.mocked(useModal().openDialog).mockClear();
    vi.mocked(useModal().confirm).mockClear();
  });

  it('offers the recovery key before a reset when the identity is locked', async () => {
    const user = userEvent.setup();
    const value = context('locked');
    vi.mocked(useMatrixClient).mockReturnValue(value as any);
    renderWithProviders(<MatrixEncryptionNotice />);

    expect(
      screen.getByRole('button', { name: 'Reset encryption' }),
    ).toBeTruthy();
    await user.click(
      screen.getByRole('button', { name: 'Enter recovery key' }),
    );

    expect(useModal().openDialog).toHaveBeenCalledWith(
      MatrixRecoveryKeyDialog,
      {
        resolve: { importRecoveryKey: value.importCryptoRecoveryKey },
      },
    );
    expect(useModal().confirm).not.toHaveBeenCalled();
    expect(value.resetCryptoIdentity).not.toHaveBeenCalled();
  });

  it('shows nothing while encryption works', () => {
    vi.mocked(useMatrixClient).mockReturnValue(context('ready') as any);
    renderWithProviders(<MatrixEncryptionNotice />);

    expect(
      screen.queryByRole('button', { name: 'Enter recovery key' }),
    ).toBeNull();
  });
});
