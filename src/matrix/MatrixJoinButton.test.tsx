import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  matrixCredentialsPassword,
  matrixCredentialsRecoveryKey,
  matrixCredentialsRetrieve,
} from 'waldur-js-client';

import { OWN_ERROR_STATE } from '@/core/queryRetry';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { MatrixCredentialsDialog } from './MatrixJoinButton';

const IDENTITY = {
  homeserver_url: 'https://chat.example.com',
  matrix_user_id: '@alice:chat.example.com',
};

// A query tells the dialog of a change on a timer; this lets it render.
const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

const openDialog = (credentials: object) => {
  vi.mocked(matrixCredentialsRetrieve).mockResolvedValue({
    data: credentials,
  } as any);
  return renderWithProviders(
    <MatrixCredentialsDialog
      resolve={{ roomAlias: '#waldur-1:chat.example.com' }}
    />,
  );
};

describe('MatrixCredentialsDialog', () => {
  afterEach(() => {
    vi.mocked(matrixCredentialsRetrieve).mockReset();
    vi.mocked(matrixCredentialsPassword).mockReset();
    vi.mocked(matrixCredentialsRecoveryKey).mockReset();
    vi.mocked(useNotify().showErrorResponse).mockClear();
    vi.mocked(useModal().closeDialog).mockClear();
  });

  it('shows what a password login needs', async () => {
    openDialog({ method: 'password', ...IDENTITY });

    expect(await screen.findByText('Generate password')).toBeTruthy();
    expect(screen.getByText('Homeserver')).toBeTruthy();
    expect(screen.getByText('Matrix user ID')).toBeTruthy();
    expect(screen.getByText('Room alias')).toBeTruthy();
    expect(screen.queryByText(/single sign-on/i)).toBeNull();
    // Before the first click, so a password saved in a client is no surprise.
    expect(
      screen.getByText(
        'Generating a password replaces any Matrix password set before.',
      ),
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Reveal' })).toBeNull();
    expect(matrixCredentialsPassword).not.toHaveBeenCalled();
  });

  it('shows what a single sign-on login needs', async () => {
    openDialog({ method: 'oidc', ...IDENTITY });

    expect(await screen.findByText(/single sign-on/i)).toBeTruthy();
    expect(screen.getByText('Homeserver')).toBeTruthy();
    expect(screen.getByText('Room alias')).toBeTruthy();
    expect(screen.queryByText('Matrix user ID')).toBeNull();
    expect(screen.queryByText('Generate password')).toBeNull();
    expect(matrixCredentialsPassword).not.toHaveBeenCalled();
  });

  it('says so when external clients are switched off', async () => {
    openDialog({ method: 'none', ...IDENTITY });

    expect(
      await screen.findByText(
        'External Matrix clients are not enabled on this server.',
      ),
    ).toBeTruthy();
    expect(screen.queryByText('Homeserver')).toBeNull();
    expect(screen.queryByText('Open in Matrix client')).toBeNull();
  });

  it('asks for the credentials without a room', async () => {
    openDialog({ method: 'password', ...IDENTITY });

    await screen.findByText('Generate password');
    expect(matrixCredentialsRetrieve).toHaveBeenCalledWith();
  });

  // Waldur keeps no Matrix password, so the user generates one and sees it
  // only here; generating again replaces it.
  it('shows a generated password once', async () => {
    const user = userEvent.setup();
    vi.mocked(matrixCredentialsPassword).mockResolvedValue({
      data: { password: 'generated-1', ...IDENTITY },
    } as any);
    openDialog({ method: 'password', ...IDENTITY });

    await user.click(await screen.findByText('Generate password'));

    expect(await screen.findByRole('button', { name: 'Reveal' })).toBeTruthy();
    expect(screen.getByText(/will not be shown again/i)).toBeTruthy();
    expect(screen.queryByText('generated-1')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Reveal' }));
    expect(screen.getByText('generated-1')).toBeTruthy();
    expect(matrixCredentialsPassword).toHaveBeenCalledTimes(1);
    // A dialog that closed on success would take the password with it.
    expect(useModal().closeDialog).not.toHaveBeenCalled();
  });

  it('replaces the password when generating again', async () => {
    const user = userEvent.setup();
    let respond: (response: any) => void;
    vi.mocked(matrixCredentialsPassword)
      .mockResolvedValueOnce({
        data: { password: 'generated-1', ...IDENTITY },
      } as any)
      .mockReturnValueOnce(
        new Promise((resolve) => {
          respond = resolve;
        }) as any,
      );
    openDialog({ method: 'password', ...IDENTITY });
    await user.click(await screen.findByText('Generate password'));
    await screen.findByRole('button', { name: 'Reveal' });
    await user.click(screen.getByRole('button', { name: 'Reveal' }));
    expect(screen.getByText('generated-1')).toBeTruthy();

    await user.click(screen.getByText('Generate a new password'));

    // The first one stays until the new one is there.
    expect(
      screen.getByRole('button', { name: 'Generate a new password' }),
    ).toBeDisabled();
    expect(matrixCredentialsPassword).toHaveBeenCalledTimes(2);
    expect(screen.getByText('generated-1')).toBeTruthy();

    respond({ data: { password: 'generated-2', ...IDENTITY } });
    // The new password arrives once the button stops pending.
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Generate a new password' }),
      ).toBeEnabled(),
    );
    // The first one was revealed; the new one starts out masked.
    expect(screen.queryByText('generated-1')).toBeNull();
    expect(screen.queryByText('generated-2')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Reveal' }));
    expect(screen.getByText('generated-2')).toBeTruthy();
  });

  // Every request replaces the password on the homeserver, so a second one
  // sent meanwhile could leave the dialog showing a password already replaced.
  it('generates one password at a time', async () => {
    const user = userEvent.setup();
    let respond: (response: any) => void;
    vi.mocked(matrixCredentialsPassword).mockReturnValue(
      new Promise((resolve) => {
        respond = resolve;
      }) as any,
    );
    openDialog({ method: 'password', ...IDENTITY });
    const generate = await screen.findByRole('button', {
      name: 'Generate password',
    });

    await user.click(generate);

    expect(generate).toBeDisabled();
    await user.click(generate);
    expect(matrixCredentialsPassword).toHaveBeenCalledTimes(1);

    respond({ data: { password: 'generated-1', ...IDENTITY } });
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Generate a new password' }),
      ).toBeEnabled(),
    );
  });

  it('keeps the last password when generating again fails', async () => {
    const user = userEvent.setup();
    vi.mocked(matrixCredentialsPassword)
      .mockResolvedValueOnce({
        data: { password: 'generated-1', ...IDENTITY },
      } as any)
      .mockRejectedValueOnce(new Error('503'));
    openDialog({ method: 'password', ...IDENTITY });
    await user.click(await screen.findByText('Generate password'));
    await screen.findByRole('button', { name: 'Reveal' });

    await user.click(screen.getByText('Generate a new password'));

    await waitFor(() =>
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        expect.anything(),
        'Unable to generate a Matrix password.',
      ),
    );
    await user.click(screen.getByRole('button', { name: 'Reveal' }));
    expect(screen.getByText('generated-1')).toBeTruthy();
  });

  it('announces a generated password', async () => {
    const user = userEvent.setup();
    vi.mocked(matrixCredentialsPassword).mockResolvedValue({
      data: { password: 'generated-1', ...IDENTITY },
    } as any);
    const { container } = openDialog({ method: 'password', ...IDENTITY });
    const generate = await screen.findByText('Generate password');
    // Testing Library has no query for a live region. It has to be there
    // before the password is, or the first one goes unannounced.
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const region = container.querySelector('[aria-live="polite"]');
    expect(region).toBeEmptyDOMElement();

    await user.click(generate);

    expect(region).toContainElement(
      await screen.findByRole('button', { name: 'Reveal' }),
    );
  });

  it('keeps the password when reloading the credentials fails', async () => {
    const user = userEvent.setup();
    vi.mocked(matrixCredentialsPassword).mockResolvedValue({
      data: { password: 'generated-1', ...IDENTITY },
    } as any);
    const { queryClient } = openDialog({ method: 'password', ...IDENTITY });
    await user.click(await screen.findByText('Generate password'));
    await user.click(await screen.findByRole('button', { name: 'Reveal' }));

    // What a return to the window does, with the backend failing meanwhile.
    let fail: (error: Error) => void;
    vi.mocked(matrixCredentialsRetrieve).mockReturnValue(
      new Promise((_, reject) => {
        fail = reject;
      }) as any,
    );
    let reloaded: Promise<void>;
    await act(async () => {
      reloaded = queryClient.refetchQueries({
        queryKey: ['matrixCredentials'],
      });
      await tick();
    });

    // While the request is under way...
    expect(matrixCredentialsRetrieve).toHaveBeenCalledTimes(2);
    expect(screen.getByText('generated-1')).toBeTruthy();

    await act(async () => {
      fail(new Error('503'));
      await reloaded;
      await tick();
    });

    // ...and once it has failed.
    expect(screen.getByText('generated-1')).toBeTruthy();
    expect(screen.queryByText('Unable to load Matrix credentials.')).toBeNull();
  });

  it('shows no error while the credentials are loading', async () => {
    let respond: (response: any) => void;
    vi.mocked(matrixCredentialsRetrieve).mockReturnValue(
      new Promise((resolve) => {
        respond = resolve;
      }) as any,
    );
    renderWithProviders(
      <MatrixCredentialsDialog
        resolve={{ roomAlias: '#waldur-1:chat.example.com' }}
      />,
    );
    await act(tick);

    expect(screen.queryByText('Unable to load Matrix credentials.')).toBeNull();
    expect(screen.queryByText('Generate password')).toBeNull();

    respond({ data: { method: 'password', ...IDENTITY } });
    expect(await screen.findByText('Generate password')).toBeTruthy();
  });

  it('says so when the credentials cannot be loaded, and loads them again', async () => {
    const user = userEvent.setup();
    vi.mocked(matrixCredentialsRetrieve).mockRejectedValue(new Error('503'));
    const { queryClient } = renderWithProviders(
      <MatrixCredentialsDialog
        resolve={{ roomAlias: '#waldur-1:chat.example.com' }}
      />,
    );

    expect(
      await screen.findByText('Unable to load Matrix credentials.'),
    ).toBeTruthy();
    expect(screen.queryByText('Generate password')).toBeNull();
    // The dialog shows the failure itself: without this the app's error
    // handler leaves for the not-found page on a 404, closing the dialog.
    expect(
      queryClient.getQueryCache().find({ queryKey: ['matrixCredentials'] })
        ?.meta,
    ).toEqual(OWN_ERROR_STATE);

    vi.mocked(matrixCredentialsRetrieve).mockResolvedValue({
      data: { method: 'password', ...IDENTITY },
    } as any);
    await user.click(screen.getByRole('button', { name: 'Reload' }));

    expect(await screen.findByText('Generate password')).toBeTruthy();
  });

  it('does not keep the credentials once the dialog closes', async () => {
    const { queryClient, unmount } = openDialog({
      method: 'password',
      ...IDENTITY,
    });
    await screen.findByText('Generate password');

    unmount();

    await waitFor(() =>
      expect(queryClient.getQueryCache().getAll()).toHaveLength(0),
    );
  });

  it('does not keep the password once the dialog closes', async () => {
    const user = userEvent.setup();
    vi.mocked(matrixCredentialsPassword).mockResolvedValue({
      data: { password: 'generated-1', ...IDENTITY },
    } as any);
    const { queryClient, unmount } = openDialog({
      method: 'password',
      ...IDENTITY,
    });
    await user.click(await screen.findByText('Generate password'));
    await screen.findByRole('button', { name: 'Reveal' });

    unmount();

    await waitFor(() =>
      expect(queryClient.getMutationCache().getAll()).toHaveLength(0),
    );
  });

  // Element needs the key to read encrypted history; each fetch is recorded,
  // so it is fetched only on request, and shown masked until revealed.
  it('shows the recovery key only when asked, masked', async () => {
    const user = userEvent.setup();
    vi.mocked(matrixCredentialsRecoveryKey).mockResolvedValue({
      data: { recovery_key: 'EsSz ykH7 LCZx 7Cae' },
    } as any);
    openDialog({ method: 'oidc', ...IDENTITY });
    const show = await screen.findByRole('button', {
      name: 'Show recovery key',
    });
    expect(matrixCredentialsRecoveryKey).not.toHaveBeenCalled();

    await user.click(show);

    const reveal = await screen.findByRole('button', { name: 'Reveal' });
    expect(screen.queryByText('EsSz ykH7 LCZx 7Cae')).toBeNull();
    await user.click(reveal);
    expect(screen.getByText('EsSz ykH7 LCZx 7Cae')).toBeTruthy();
    expect(matrixCredentialsRecoveryKey).toHaveBeenCalledTimes(1);
    expect(useModal().closeDialog).not.toHaveBeenCalled();
  });

  it('says when Waldur holds no recovery key that works', async () => {
    const user = userEvent.setup();
    vi.mocked(matrixCredentialsRecoveryKey).mockResolvedValue({
      data: { recovery_key: null },
    } as any);
    openDialog({ method: 'password', ...IDENTITY });

    await user.click(
      await screen.findByRole('button', { name: 'Show recovery key' }),
    );

    expect(
      await screen.findByText(/Waldur holds no recovery key for you yet/),
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Reveal' })).toBeNull();
  });

  it('does not keep the recovery key once the dialog closes', async () => {
    const user = userEvent.setup();
    vi.mocked(matrixCredentialsRecoveryKey).mockResolvedValue({
      data: { recovery_key: 'EsSz ykH7 LCZx 7Cae' },
    } as any);
    const { queryClient, unmount } = openDialog({
      method: 'oidc',
      ...IDENTITY,
    });
    await user.click(
      await screen.findByRole('button', { name: 'Show recovery key' }),
    );
    await screen.findByRole('button', { name: 'Reveal' });

    unmount();

    await waitFor(() =>
      expect(queryClient.getMutationCache().getAll()).toHaveLength(0),
    );
  });

  it('offers no recovery key when external clients are switched off', async () => {
    openDialog({ method: 'none', ...IDENTITY });

    await screen.findByText(
      'External Matrix clients are not enabled on this server.',
    );
    expect(screen.queryByText('Show recovery key')).toBeNull();
  });

  it('reports a password that could not be generated', async () => {
    const user = userEvent.setup();
    vi.mocked(matrixCredentialsPassword).mockRejectedValue(new Error('503'));
    openDialog({ method: 'password', ...IDENTITY });

    await user.click(await screen.findByText('Generate password'));

    await waitFor(() =>
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        expect.anything(),
        'Unable to generate a Matrix password.',
      ),
    );
    expect(screen.queryByRole('button', { name: 'Reveal' })).toBeNull();
  });
});
