import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { oauthConnectedAppsDestroy } from 'waldur-js-client';

import { inActionsMenu, renderWithProviders } from '@/test/harness';

import { ConnectedAppRevokeButton } from './ConnectedAppRevokeButton';

// The hook has its own tests; these check how the action wires it.
const { captured, mutate } = vi.hoisted(() => ({
  captured: { value: null as any },
  mutate: vi.fn(),
}));

vi.mock('@/modal/useManagedMutation', () => ({
  useManagedMutation: (config: any) => {
    captured.value = config;
    return { isPending: false, mutate };
  },
}));

const row = { uuid: 'app-1', client_name: 'Claude Code' } as any;

const renderAction = () => {
  const refetch = vi.fn();
  renderWithProviders(
    inActionsMenu(<ConnectedAppRevokeButton row={row} refetch={refetch} />),
  );
  return { refetch };
};

describe('ConnectedAppRevokeButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    captured.value = null;
  });

  it('asks for confirmation before revoking', async () => {
    const user = userEvent.setup();
    renderAction();
    await user.click(screen.getByText('Revoke'));
    expect(mutate).toHaveBeenCalled();
    expect(captured.value.confirmation.body).toContain('Claude Code');
    expect(captured.value.confirmation.options).toEqual({
      forDeletion: true,
      positiveButton: 'Revoke',
    });
  });

  it('deletes the connected app by its uuid', () => {
    renderAction();
    captured.value.mutationFn();
    expect(oauthConnectedAppsDestroy).toHaveBeenCalledWith({
      path: { uuid: 'app-1' },
    });
  });

  it('counts an app that has already lost access as revoked', async () => {
    renderAction();
    vi.mocked(oauthConnectedAppsDestroy).mockRejectedValueOnce({
      status: 404,
    });
    await expect(captured.value.mutationFn()).resolves.toBeUndefined();
  });

  it('reports any other failure', async () => {
    renderAction();
    vi.mocked(oauthConnectedAppsDestroy).mockRejectedValueOnce({
      status: 500,
    });
    await expect(captured.value.mutationFn()).rejects.toEqual({ status: 500 });
  });

  it('reloads the list after revoking, so the app disappears', () => {
    const { refetch } = renderAction();
    expect(captured.value.refetch).toBe(refetch);
  });
});
