import { act, render, waitFor } from '@testing-library/react';
import { FC, useContext, useEffect } from 'react';
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
    matrixRTC: { start: vi.fn() },
    http: {
      tokenManager: {
        opts: { refreshToken: 'refresh-1' } as { refreshToken?: string },
        latestTokenRefreshExpiry: undefined as Date | undefined,
        doTokenRefresh: vi.fn(),
      },
    },
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
      }),
    );
    // Waldur's sessions refresh through Matrix /refresh, starting from the
    // expiry the session came with.
    const { tokenManager } = h.createClient.mock.results[0].value.http;
    expect(vi.isMockFunction(tokenManager.doTokenRefresh)).toBe(false);
    expect(tokenManager.latestTokenRefreshExpiry).toBeInstanceOf(Date);
    // Calls run their own MatrixRTC session; the client's per-room ones stay
    // off.
    const { matrixRTC } = h.createClient.mock.results[0].value;
    expect(vi.isMockFunction(matrixRTC.start)).toBe(false);
    expect(ctx.activeRoomId).toBe('!room:example.com');
    expect(ctx.deniedRoomUuids.size).toBe(0);
  });

  it('marks the room inaccessible when the caller is not a member', async () => {
    vi.mocked(matrixRoomsOpen).mockRejectedValue({
      detail: 'You are not a member of this room.',
      response: { status: 403 },
    });
    renderProvider();

    await act(() => ctx.connect('room-uuid'));

    expect(ctx.deniedRoomUuids).toEqual(new Set(['room-uuid']));
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
    const { tokenManager } = h.createClient.mock.results[0].value.http;
    vi.mocked(matrixSession).mockRejectedValue({ response: { status: 401 } });

    await expect(tokenManager.doTokenRefresh()).resolves.toBe('logout');
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

  describe('the room on screen', () => {
    const opened = (uuid: string) =>
      ({ data: { room_id: `!${uuid}:s` } }) as any;
    const flushMicrotasks = () => act(() => Promise.resolve());
    const answer = (send: () => void) =>
      act(() => {
        send();
        return Promise.resolve();
      });

    // A deferred answer per room, so a test decides the order they arrive in.
    const deferOpens = () => {
      const answers: Record<string, (value?: unknown) => void> = {};
      vi.mocked(matrixRoomsOpen).mockImplementation(
        ({ path }: any) =>
          new Promise((resolve, reject) => {
            answers[path.uuid] = (failure) =>
              failure ? reject(failure) : resolve(opened(path.uuid));
          }) as any,
      );
      return answers;
    };

    const connected = async (roomUuid: string) => {
      vi.mocked(matrixRoomsOpen).mockImplementation(
        ({ path }: any) => Promise.resolve(opened(path.uuid)) as any,
      );
      renderProvider();
      await act(() => ctx.connect(roomUuid));
      await act(() => h.client.handlers.sync('PREPARED'));
    };

    it('reopens the room beneath when the view on top closes', async () => {
      await connected('page-room');
      ctx.registerRoomView('page-room');
      const closeDrawer = ctx.registerRoomView('drawer-room');
      await act(() => ctx.connect('drawer-room'));
      expect(ctx.activeRoomUuid).toBe('drawer-room');

      closeDrawer();
      await flushMicrotasks();

      await waitFor(() => expect(ctx.activeRoomUuid).toBe('page-room'));
    });

    it('leaves the room alone when no view is beneath', async () => {
      await connected('drawer-room');
      const closeDrawer = ctx.registerRoomView('drawer-room');
      vi.mocked(matrixRoomsOpen).mockClear();

      closeDrawer();
      await flushMicrotasks();

      expect(ctx.activeRoomUuid).toBe('drawer-room');
      expect(vi.mocked(matrixRoomsOpen)).not.toHaveBeenCalled();
    });

    it('leaves the room alone when a view beneath closes', async () => {
      await connected('page-room');
      const closePage = ctx.registerRoomView('page-room');
      ctx.registerRoomView('drawer-room');
      await act(() => ctx.connect('drawer-room'));
      vi.mocked(matrixRoomsOpen).mockClear();

      closePage();
      await flushMicrotasks();

      expect(ctx.activeRoomUuid).toBe('drawer-room');
      expect(vi.mocked(matrixRoomsOpen)).not.toHaveBeenCalled();
    });

    it('does not fight a view that replaces the one on top', async () => {
      await connected('page-room');
      ctx.registerRoomView('page-room');
      const closeFirst = ctx.registerRoomView('first-room');
      await act(() => ctx.connect('first-room'));
      vi.mocked(matrixRoomsOpen).mockClear();

      // As React does on a keyed remount: one commit, cleanup first.
      await answer(() => {
        closeFirst();
        ctx.registerRoomView('second-room');
        ctx.connect('second-room');
      });

      expect(ctx.activeRoomUuid).toBe('second-room');
      expect(vi.mocked(matrixRoomsOpen)).toHaveBeenCalledTimes(1);
    });

    it('takes the latest pick when answers arrive out of order', async () => {
      await connected('first-room');
      const answers = deferOpens();

      act(() => {
        ctx.connect('older-pick');
        ctx.connect('latest-pick');
      });
      await answer(() => answers['latest-pick']());
      await answer(() => answers['older-pick']());

      expect(ctx.activeRoomUuid).toBe('latest-pick');
    });

    it('ignores a failure of an older pick', async () => {
      await connected('first-room');
      const answers = deferOpens();

      act(() => {
        ctx.connect('older-pick');
        ctx.connect('latest-pick');
      });
      await answer(() => answers['latest-pick']());
      await answer(() => answers['older-pick']({ response: { status: 500 } }));

      expect(ctx.activeRoomUuid).toBe('latest-pick');
      expect(ctx.error).toBeNull();
    });

    it('drops the request of a view that closed before its answer', async () => {
      await connected('page-room');
      ctx.registerRoomView('page-room');
      const closeDrawer = ctx.registerRoomView('drawer-room');
      const answers = deferOpens();

      act(() => {
        ctx.connect('drawer-room');
      });
      closeDrawer();
      await flushMicrotasks();
      await answer(() => answers['page-room']());
      await answer(() => answers['drawer-room']());

      expect(ctx.activeRoomUuid).toBe('page-room');
    });

    it('reopens a pick still unanswered when the session restarts', async () => {
      await connected('first-room');
      const answers = deferOpens();
      act(() => {
        ctx.connect('picked-room');
      });
      vi.mocked(matrixRoomsOpen).mockImplementation(
        ({ path }: any) => Promise.resolve(opened(path.uuid)) as any,
      );

      await signOut();
      await answer(() => answers['picked-room']());
      await act(() => h.client.handlers.sync('PREPARED'));

      await waitFor(() => expect(ctx.activeRoomUuid).toBe('picked-room'));
    });

    it('gives the newest view its room once connected', async () => {
      renderProvider();
      act(() => {
        ctx.connect('bootstrap-uuid', { activate: false });
      });
      ctx.registerRoomView('page-room');
      ctx.registerRoomView('drawer-room');
      act(() => {
        ctx.connect('drawer-room');
        // The page's late deep link, which runs as the client connects.
        ctx.connect('page-room');
      });
      await waitFor(() => expect(h.client.handlers.sync).toBeDefined());

      await act(() => h.client.handlers.sync('PREPARED'));

      await waitFor(() => expect(ctx.activeRoomUuid).toBe('drawer-room'));
    });

    it('marks only the refused room as denied', async () => {
      await connected('page-room');
      vi.mocked(matrixRoomsOpen).mockRejectedValueOnce({
        detail: 'You are not a member of this room.',
        response: { status: 403 },
      });

      await act(() => ctx.connect('other-room'));
      expect(ctx.deniedRoomUuids).toEqual(new Set(['other-room']));

      await act(() => ctx.connect('page-room'));
      expect(ctx.deniedRoomUuids).toEqual(new Set(['other-room']));
    });

    it('keeps every refused room denied', async () => {
      await connected('page-room');
      const refusal = {
        detail: 'You are not a member of this room.',
        response: { status: 403 },
      };
      vi.mocked(matrixRoomsOpen)
        .mockRejectedValueOnce(refusal)
        .mockRejectedValueOnce(refusal);

      await act(() => ctx.connect('first-room'));
      await act(() => ctx.connect('second-room'));

      expect(ctx.deniedRoomUuids).toEqual(
        new Set(['first-room', 'second-room']),
      );
    });

    it('restarts on the newest view, not on a room it was refused', async () => {
      await connected('page-room');
      ctx.registerRoomView('page-room');
      vi.mocked(matrixRoomsOpen).mockRejectedValueOnce({
        detail: 'You are not a member of this room.',
        response: { status: 403 },
      });
      await act(() => ctx.connect('refused-room'));
      vi.mocked(matrixRoomsOpen).mockClear();

      await signOut();

      expect(vi.mocked(matrixRoomsOpen)).toHaveBeenCalledWith({
        path: { uuid: 'page-room' },
      });
      expect(vi.mocked(matrixRoomsOpen)).not.toHaveBeenCalledWith({
        path: { uuid: 'refused-room' },
      });
    });

    it('forgets a failure once that room opens', async () => {
      await connected('first-room');
      let fail: (reason: unknown) => void;
      let succeed: (value: unknown) => void;
      vi.mocked(matrixRoomsOpen)
        .mockImplementationOnce(
          () => new Promise((_, reject) => (fail = reject)) as any,
        )
        .mockImplementationOnce(
          () => new Promise((resolve) => (succeed = resolve)) as any,
        );
      act(() => {
        ctx.connect('flaky-room');
        ctx.connect('flaky-room');
      });

      await answer(() => fail({ response: { status: 500 } }));
      expect(ctx.failedRoomUuid).toBe('flaky-room');
      await answer(() => succeed(opened('flaky-room')));

      expect(ctx.activeRoomUuid).toBe('flaky-room');
      expect(ctx.failedRoomUuid).toBeNull();
    });

    it('clears the denial once that room opens', async () => {
      await connected('page-room');
      vi.mocked(matrixRoomsOpen).mockRejectedValueOnce({
        detail: 'You are not a member of this room.',
        response: { status: 403 },
      });
      await act(() => ctx.connect('other-room'));

      await act(() => ctx.connect('other-room'));

      expect(ctx.deniedRoomUuids.size).toBe(0);
    });

    it('reports a refused switch and keeps the active room', async () => {
      await connected('first-room');
      vi.mocked(matrixRoomsOpen).mockRejectedValueOnce({
        response: { status: 500 },
      });

      await act(() => ctx.connect('refused-room'));

      expect(ctx.activeRoomUuid).toBe('first-room');
      expect(ctx.error).toBeTruthy();
      expect(ctx.failedRoomUuid).toBe('refused-room');
    });

    it('clears the error as soon as the switch is retried', async () => {
      await connected('first-room');
      vi.mocked(matrixRoomsOpen).mockRejectedValueOnce({
        response: { status: 500 },
      });
      await act(() => ctx.connect('refused-room'));
      const answers = deferOpens();

      act(() => {
        ctx.connect('refused-room');
      });

      expect(ctx.error).toBeNull();
      expect(ctx.failedRoomUuid).toBeNull();
      await answer(() => answers['refused-room']());
      expect(ctx.activeRoomUuid).toBe('refused-room');
    });
  });

  describe('a room asked for while the client connects', () => {
    const bootstrap = () =>
      act(() => {
        ctx.connect('bootstrap-uuid', { activate: false });
      });
    const finishConnecting = async () => {
      await waitFor(() => expect(h.client.handlers.sync).toBeDefined());
      await act(() => h.client.handlers.sync('PREPARED'));
    };

    it('opens once connected, when the background sync started first', async () => {
      renderProvider();
      await bootstrap();

      await act(() => ctx.connect('room-uuid'));
      await finishConnecting();

      await waitFor(() => expect(ctx.activeRoomUuid).toBe('room-uuid'));
    });

    it('opens the room asked for last', async () => {
      renderProvider();
      await bootstrap();

      await act(() => ctx.connect('first-uuid'));
      await act(() => ctx.connect('second-uuid'));
      await finishConnecting();

      await waitFor(() => expect(ctx.activeRoomUuid).toBe('second-uuid'));
      expect(vi.mocked(matrixRoomsOpen)).not.toHaveBeenCalledWith({
        path: { uuid: 'first-uuid' },
      });
    });

    it('opens when asked for from an effect that sees the client connect', async () => {
      const OpensRoomOnceConnected: FC = () => {
        const { connect, connectionState } = useContext(MatrixChatContext);
        useEffect(() => {
          if (connectionState === 'connected') connect('room-uuid');
        }, [connectionState, connect]);
        return null;
      };
      render(
        <MatrixChatProvider>
          <Probe />
          <OpensRoomOnceConnected />
        </MatrixChatProvider>,
      );
      await bootstrap();

      await finishConnecting();

      await waitFor(() => expect(ctx.activeRoomUuid).toBe('room-uuid'));
    });

    it('does not open again the room the client is already opening', async () => {
      renderProvider();

      const opening = act(() => ctx.connect('room-uuid'));
      await act(() => ctx.connect('room-uuid'));
      await opening;
      await finishConnecting();

      expect(vi.mocked(matrixRoomsOpen)).toHaveBeenCalledTimes(1);
    });

    it('keeps the room asked for when the session has to restart', async () => {
      renderProvider();
      await act(() => ctx.connect('room-uuid'));
      await act(() => h.client.handlers.sync('PREPARED'));
      await act(() => h.client.handlers.sync('ERROR'));
      vi.mocked(matrixRoomsOpen).mockResolvedValue({
        data: { room_id: '!other:example.com' },
      } as any);
      await act(() => ctx.connect('other-uuid'));
      const signedOut = h.client;
      h.client = makeClient();
      h.createClient.mockReturnValue(h.client);

      await signOut(signedOut);

      await waitFor(() => expect(h.createClient).toHaveBeenCalledTimes(2));
      await waitFor(() => expect(ctx.activeRoomUuid).toBe('other-uuid'));
    });

    it('forgets the room when the Waldur user changes', async () => {
      const { rerender } = renderProvider();
      await bootstrap();
      await act(() => ctx.connect('room-uuid'));
      vi.mocked(useUser).mockReturnValue({ uuid: 'user-2' } as any);

      rerender(
        <MatrixChatProvider>
          <Probe />
        </MatrixChatProvider>,
      );
      await waitFor(() => expect(ctx.connectionState).toBe('disconnected'));
      await act(async () => {
        await h.client.handlers.sync?.('PREPARED');
      });

      expect(vi.mocked(matrixRoomsOpen)).not.toHaveBeenCalled();
    });

    it('leaves a bootstrap unfocused when nothing was asked for', async () => {
      renderProvider();
      await bootstrap();

      await finishConnecting();

      expect(vi.mocked(matrixRoomsOpen)).not.toHaveBeenCalled();
      expect(ctx.activeRoomUuid).toBeNull();
    });
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
