import { focusManager } from '@tanstack/react-query';
import { act, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { matrixCredentialsRetrieve } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { MatrixCredentialsDialog } from './MatrixJoinButton';

const IDENTITY = {
  homeserver_url: 'https://chat.example.com',
  matrix_user_id: '@alice:chat.example.com',
};

const openDialog = (credentials: object) => {
  vi.mocked(matrixCredentialsRetrieve).mockResolvedValue({
    data: credentials,
  } as any);
  renderWithProviders(
    <MatrixCredentialsDialog
      resolve={{ roomAlias: '#waldur-1:chat.example.com' }}
    />,
  );
};

describe('MatrixCredentialsDialog', () => {
  afterEach(() => {
    vi.mocked(matrixCredentialsRetrieve).mockReset();
  });

  // The password is long-lived, so it should not outlive the dialog in memory.
  it('drops the credentials from the cache once the dialog closes', async () => {
    vi.mocked(matrixCredentialsRetrieve).mockResolvedValue({
      data: { method: 'password', password: 'derived', ...IDENTITY },
    } as any);
    const { queryClient, unmount } = renderWithProviders(
      <MatrixCredentialsDialog
        resolve={{ roomAlias: '#waldur-1:chat.example.com' }}
      />,
    );
    expect(await screen.findByText('Password')).toBeTruthy();
    await act(async () => {
      focusManager.setFocused(false);
      focusManager.setFocused(true);
      await new Promise((settle) => setTimeout(settle, 50));
    });
    expect(matrixCredentialsRetrieve).toHaveBeenCalledTimes(1);

    unmount();

    await waitFor(() =>
      expect(queryClient.getQueryData(['matrixCredentials'])).toBeUndefined(),
    );
  });

  it('shows what a password login needs', async () => {
    openDialog({ method: 'password', password: 'derived', ...IDENTITY });

    expect(await screen.findByText('Password')).toBeTruthy();
    expect(screen.getByText('Homeserver')).toBeTruthy();
    expect(screen.getByText('Matrix user ID')).toBeTruthy();
    expect(screen.getByText('Room alias')).toBeTruthy();
    expect(screen.queryByText(/single sign-on/i)).toBeNull();
  });

  it('shows what a single sign-on login needs', async () => {
    openDialog({ method: 'oidc', ...IDENTITY });

    expect(await screen.findByText(/single sign-on/i)).toBeTruthy();
    expect(screen.getByText('Homeserver')).toBeTruthy();
    expect(screen.getByText('Room alias')).toBeTruthy();
    expect(screen.queryByText('Matrix user ID')).toBeNull();
    expect(screen.queryByText('Password')).toBeNull();
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
    openDialog({ method: 'password', password: 'derived', ...IDENTITY });

    await screen.findByText('Password');
    expect(matrixCredentialsRetrieve).toHaveBeenCalledWith();
  });
});
