import { act, render, waitFor } from '@testing-library/react';
import { TokenRefreshLogoutError } from 'matrix-js-sdk';
import { FC, useContext } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  matrixCredentialsRetrieve,
  matrixRoomsOpen,
  matrixSession,
} from 'waldur-js-client';

import { useUser } from '@/workspace/hooks';

const h = vi.hoisted(() => ({
  client: null as any,
  createClient: vi.fn(),
}));

vi.mock('matrix-js-sdk', () => {
  class TokenRefreshLogoutError extends Error {}
  class MemoryStore {}
  return {
    createClient: h.createClient,
    MemoryStore,
    TokenRefreshLogoutError,
    ClientEvent: { Sync: 'sync' },
    HttpApiEvent: { SessionLoggedOut: 'Session.logged_out' },
    PendingEventOrdering: { Detached: 'detached' },
  };
});

import { MatrixChatContext } from './MatrixChatContext';
import { MatrixChatProvider } from './MatrixChatProvider';
import { MatrixChatContextValue } from './types';

const SESSION = {
  homeserver_url: 'https://chat.example.com',
  matrix_user_id: '@alice:example.com',
  device_id: 'WALDUR_WEB_A',
  access_token: 'access-1',
  refresh_token: 'refresh-1',
  expires_in_ms: 300000,
};

const makeClient = () => {
  const handlers: Record<string, (...args: any[]) => void> = {};
  return {
    handlers,
    on: vi.fn((event: string, handler: any) => {
      handlers[event] = handler;
    }),
    removeListener: vi.fn(),
    removeAllListeners: vi.fn(),
    startClient: vi.fn(),
    stopClient: vi.fn(),
    logout: vi.fn(() => Promise.resolve()),
    getRoom: vi.fn(() => ({ getMyMembership: () => 'join' })),
    joinRoom: vi.fn(),
  };
};

const signOut = (client = h.client) =>
  act(() => {
    client.handlers['Session.logged_out']({ errcode: 'M_UNKNOWN_TOKEN' });
  });

// The automatic reconnect after a sign-out asks Waldur for a new session;
// refusing it is how a session ends.
const signOutWithSessionRefused = async () => {
  vi.mocked(matrixSession).mockRejectedValueOnce({ response: { status: 404 } });
  await signOut();
  await waitFor(() => expect(ctx.connectionState).toBe('ended'));
};

let ctx: MatrixChatContextValue;
const Probe: FC = () => {
  ctx = useContext(MatrixChatContext);
  return null;
};

const renderProvider = () =>
  render(
    <MatrixChatProvider>
      <Probe />
    </MatrixChatProvider>,
  );

describe('MatrixChatProvider', () => {
  beforeEach(() => {
    vi.mocked(useUser).mockReturnValue({ uuid: 'user-1' } as any);
    h.client = makeClient();
    h.createClient.mockReturnValue(h.client);
    vi.mocked(matrixSession).mockResolvedValue({ data: SESSION } as any);
    vi.mocked(matrixRoomsOpen).mockResolvedValue({
      data: { room_id: '!room:example.com' },
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('connects with a web session and opens the room', async () => {
    renderProvider();

    await act(() => ctx.connect('room-uuid'));

    expect(vi.mocked(matrixCredentialsRetrieve)).not.toHaveBeenCalled();
    expect(vi.mocked(matrixRoomsOpen)).toHaveBeenCalledWith({
      path: { uuid: 'room-uuid' },
    });
    expect(h.createClient).toHaveBeenCalledWith(
      expect.objectContaining({
        baseUrl: SESSION.homeserver_url,
        userId: SESSION.matrix_user_id,
        deviceId: SESSION.device_id,
        accessToken: SESSION.access_token,
        refreshToken: SESSION.refresh_token,
        tokenRefreshFunction: expect.any(Function),
      }),
    );
    expect(ctx.activeRoomId).toBe('!room:example.com');
    expect(ctx.roomAccessDenied).toBe(false);
  });

  it('marks the room inaccessible when the caller is not a member', async () => {
    vi.mocked(matrixRoomsOpen).mockRejectedValue({
      detail: 'You are not a member of this room.',
      response: { status: 403 },
    });
    renderProvider();

    await act(() => ctx.connect('room-uuid'));

    expect(ctx.roomAccessDenied).toBe(true);
    expect(ctx.activeRoomId).toBeNull();
  });

  it('switches rooms on a live client through the open endpoint', async () => {
    renderProvider();
    await act(() => ctx.connect('room-uuid'));
    await act(() => h.client.handlers.sync('PREPARED'));
    vi.mocked(matrixRoomsOpen).mockResolvedValue({
      data: { room_id: '!other:example.com' },
    } as any);

    await act(() => ctx.connect('other-uuid'));

    expect(vi.mocked(matrixSession)).toHaveBeenCalledTimes(1);
    expect(ctx.activeRoomId).toBe('!other:example.com');
    expect(ctx.activeRoomUuid).toBe('other-uuid');
  });

  it('reconnects with a new session when the homeserver signs it out', async () => {
    renderProvider();
    await act(() => ctx.connect('room-uuid'));
    const signedOut = h.client;
    h.client = makeClient();
    h.createClient.mockReturnValue(h.client);

    await signOut(signedOut);

    await waitFor(() => expect(h.createClient).toHaveBeenCalledTimes(2));
    expect(signedOut.stopClient).toHaveBeenCalled();
    expect(vi.mocked(matrixSession)).toHaveBeenCalledTimes(2);
    expect(ctx.activeRoomId).toBe('!room:example.com');
    await act(() => h.client.handlers.sync('PREPARED'));
    expect(ctx.connectionState).toBe('connected');
  });

  it('reconnects to the room that was open when the session was signed out', async () => {
    renderProvider();
    await act(() => ctx.connect('room-uuid'));
    await act(() => h.client.handlers.sync('PREPARED'));
    vi.mocked(matrixRoomsOpen).mockResolvedValue({
      data: { room_id: '!other:example.com' },
    } as any);
    await act(() => ctx.connect('other-uuid'));
    const signedOut = h.client;
    h.client = makeClient();
    h.createClient.mockReturnValue(h.client);

    await signOut(signedOut);

    await waitFor(() => expect(h.createClient).toHaveBeenCalledTimes(2));
    expect(vi.mocked(matrixRoomsOpen)).toHaveBeenLastCalledWith({
      path: { uuid: 'other-uuid' },
    });
    expect(ctx.activeRoomUuid).toBe('other-uuid');
  });

  it('reconnects a bootstrap session without focusing a room', async () => {
    renderProvider();
    await act(() => ctx.connect('room-uuid', { activate: false }));
    const signedOut = h.client;
    h.client = makeClient();
    h.createClient.mockReturnValue(h.client);

    await signOut(signedOut);

    await waitFor(() => expect(h.createClient).toHaveBeenCalledTimes(2));
    expect(vi.mocked(matrixRoomsOpen)).not.toHaveBeenCalled();
    expect(ctx.activeRoomUuid).toBeNull();
  });

  it('ends the session when Waldur refuses a new one after a sign-out', async () => {
    renderProvider();
    await act(() => ctx.connect('room-uuid'));

    await signOutWithSessionRefused();

    expect(h.createClient).toHaveBeenCalledTimes(1);
    expect(h.client.stopClient).toHaveBeenCalled();
  });

  it('ends the session when it is signed out again right after reconnecting', async () => {
    renderProvider();
    await act(() => ctx.connect('room-uuid'));
    const first = h.client;
    h.client = makeClient();
    h.createClient.mockReturnValue(h.client);
    await signOut(first);
    await waitFor(() => expect(h.createClient).toHaveBeenCalledTimes(2));

    await signOut();

    expect(ctx.connectionState).toBe('ended');
    expect(vi.mocked(matrixSession)).toHaveBeenCalledTimes(2);
  });

  it('reconnects again once a minute has passed since the last reconnect', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(1_000_000);
    renderProvider();
    await act(() => ctx.connect('room-uuid'));
    const first = h.client;
    h.client = makeClient();
    h.createClient.mockReturnValue(h.client);
    await signOut(first);
    await waitFor(() => expect(h.createClient).toHaveBeenCalledTimes(2));
    vi.setSystemTime(1_000_000 + 60_000);
    const second = h.client;
    h.client = makeClient();
    h.createClient.mockReturnValue(h.client);

    await signOut(second);

    await waitFor(() => expect(h.createClient).toHaveBeenCalledTimes(3));
    expect(ctx.connectionState).not.toBe('ended');
  });

  it('ends the session when Waldur refuses to start one', async () => {
    vi.mocked(matrixSession).mockRejectedValue({
      detail: 'Not found.',
      response: { status: 404 },
    });
    renderProvider();

    await act(() => ctx.connect('room-uuid'));

    expect(ctx.connectionState).toBe('ended');
    expect(h.createClient).not.toHaveBeenCalled();
  });

  it('starts a fresh session when reloading after the session ended', async () => {
    renderProvider();
    await act(() => ctx.connect('room-uuid'));
    await signOutWithSessionRefused();
    h.client = makeClient();
    h.createClient.mockReturnValue(h.client);

    await act(() => ctx.connect('room-uuid'));

    expect(vi.mocked(matrixSession)).toHaveBeenCalledTimes(3);
    expect(h.createClient).toHaveBeenCalledTimes(2);
    expect(ctx.activeRoomId).toBe('!room:example.com');
  });

  it("ends the session through the SDK's logout error when Waldur refuses one", async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{}', { status: 401 })),
    );
    renderProvider();
    await act(() => ctx.connect('room-uuid'));
    const { tokenRefreshFunction } = h.createClient.mock.calls[0][0];
    vi.mocked(matrixSession).mockRejectedValue({ response: { status: 401 } });

    await expect(tokenRefreshFunction('refresh-1')).rejects.toBeInstanceOf(
      TokenRefreshLogoutError,
    );
    vi.unstubAllGlobals();
  });

  it('mints no session when the room cannot be opened', async () => {
    vi.mocked(matrixRoomsOpen).mockRejectedValue({
      detail: 'Server error',
      response: { status: 500 },
    });
    renderProvider();

    await act(() => ctx.connect('room-uuid'));

    expect(ctx.connectionState).toBe('error');
    expect(vi.mocked(matrixSession)).not.toHaveBeenCalled();
    expect(h.createClient).not.toHaveBeenCalled();
  });

  it('bootstraps without opening or focusing a room', async () => {
    renderProvider();

    await act(() => ctx.connect('room-uuid', { activate: false }));

    expect(vi.mocked(matrixRoomsOpen)).not.toHaveBeenCalled();
    expect(ctx.activeRoomUuid).toBeNull();
  });

  it('focuses no room when a bootstrap finds the session refused', async () => {
    vi.mocked(matrixSession).mockRejectedValue({ response: { status: 404 } });
    renderProvider();

    await act(() => ctx.connect('room-uuid', { activate: false }));

    expect(ctx.connectionState).toBe('ended');
    expect(ctx.activeRoomUuid).toBeNull();
  });

  it('stays ended when a join finishes after the session ended', async () => {
    let rejectJoin: (e: unknown) => void = () => {};
    h.client.getRoom.mockReturnValue({ getMyMembership: () => 'invite' });
    h.client.joinRoom.mockReturnValue(
      new Promise((_, reject) => {
        rejectJoin = reject;
      }),
    );
    renderProvider();
    await act(() => ctx.connect('room-uuid'));
    const syncing = h.client.handlers.sync('SYNCING');

    await signOutWithSessionRefused();
    await act(async () => {
      rejectJoin(new Error('M_UNKNOWN_TOKEN'));
      await syncing;
    });

    expect(ctx.connectionState).toBe('ended');
  });

  it('clears an ended session when the Waldur user changes', async () => {
    const { rerender } = renderProvider();
    await act(() => ctx.connect('room-uuid'));
    await signOutWithSessionRefused();

    vi.mocked(useUser).mockReturnValue({ uuid: 'user-2' } as any);
    rerender(
      <MatrixChatProvider>
        <Probe />
      </MatrixChatProvider>,
    );

    await waitFor(() => expect(ctx.connectionState).not.toBe('ended'));
    expect(ctx.userId).toBeNull();
    expect(ctx.activeRoomUuid).toBeNull();
  });

  it("reconnects a new user's session even right after the previous user's reconnect", async () => {
    const { rerender } = renderProvider();
    await act(() => ctx.connect('room-uuid'));
    const first = h.client;
    h.client = makeClient();
    h.createClient.mockReturnValue(h.client);
    await signOut(first);
    await waitFor(() => expect(h.createClient).toHaveBeenCalledTimes(2));
    vi.mocked(useUser).mockReturnValue({ uuid: 'user-2' } as any);
    rerender(
      <MatrixChatProvider>
        <Probe />
      </MatrixChatProvider>,
    );
    await waitFor(() => expect(ctx.connectionState).toBe('disconnected'));
    h.client = makeClient();
    h.createClient.mockReturnValue(h.client);
    await act(() => ctx.connect('room-uuid'));
    const secondUser = h.client;
    h.client = makeClient();
    h.createClient.mockReturnValue(h.client);

    await signOut(secondUser);

    await waitFor(() => expect(h.createClient).toHaveBeenCalledTimes(4));
    expect(ctx.connectionState).not.toBe('ended');
  });

  it('signs its device out when the Waldur user changes', async () => {
    const { rerender } = renderProvider();
    await act(() => ctx.connect('room-uuid'));

    vi.mocked(useUser).mockReturnValue(undefined);
    rerender(
      <MatrixChatProvider>
        <Probe />
      </MatrixChatProvider>,
    );

    await waitFor(() => expect(h.client.logout).toHaveBeenCalledWith(true));
    expect(ctx.connectionState).toBe('disconnected');
  });
});
