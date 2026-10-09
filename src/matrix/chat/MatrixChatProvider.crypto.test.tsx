import { act, render, waitFor } from '@testing-library/react';
import { FC, useContext } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { matrixRoomsOpen, matrixSession } from 'waldur-js-client';

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

vi.mock('./crypto', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./crypto')>();
  return {
    ...actual,
    startCrypto: vi.fn(),
    setUpEncryption: vi.fn(),
    resetEncryption: vi.fn(),
  };
});

import {
  CryptoConflict,
  resetEncryption,
  setUpEncryption,
  startCrypto,
} from './crypto';
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
  recovery_key: null,
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

let ctx: MatrixChatContextValue;
const Probe: FC = () => {
  ctx = useContext(MatrixChatContext);
  return null;
};

const connectAndSync = async () => {
  render(
    <MatrixChatProvider>
      <Probe />
    </MatrixChatProvider>,
  );
  await act(() => ctx.connect('room-uuid'));
  await act(async () => {
    await h.client.handlers.sync('PREPARED');
  });
};

describe('MatrixChatProvider encryption', () => {
  beforeEach(() => {
    vi.mocked(useUser).mockReturnValue({ uuid: 'user-1' } as any);
    h.createClient.mockImplementation(() => {
      h.client = makeClient();
      return h.client;
    });
    vi.mocked(matrixSession).mockResolvedValue({ data: SESSION } as any);
    vi.mocked(matrixRoomsOpen).mockResolvedValue({
      data: { room_id: '!room:example.com' },
    } as any);
    vi.mocked(startCrypto).mockResolvedValue(undefined);
    vi.mocked(setUpEncryption).mockResolvedValue('ready');
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('starts crypto before syncing and sets it up after the first sync', async () => {
    await connectAndSync();

    expect(vi.mocked(startCrypto).mock.invocationCallOrder[0]).toBeLessThan(
      h.client.startClient.mock.invocationCallOrder[0],
    );
    expect(h.createClient).toHaveBeenCalledWith(
      expect.objectContaining({
        cryptoCallbacks: expect.objectContaining({
          getSecretStorageKey: expect.any(Function),
        }),
      }),
    );
    expect(setUpEncryption).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(ctx.cryptoState).toBe('ready'));
  });

  it('keeps chatting without encryption when crypto cannot start', async () => {
    vi.mocked(startCrypto).mockRejectedValue(new Error('CSP blocked wasm'));

    await connectAndSync();

    expect(ctx.cryptoState).toBe('error');
    expect(h.client.startClient).toHaveBeenCalled();
    expect(setUpEncryption).not.toHaveBeenCalled();
    expect(ctx.connectionState).toBe('connected');
  });

  it('reports a locked identity', async () => {
    vi.mocked(setUpEncryption).mockResolvedValue('locked');

    await connectAndSync();

    await waitFor(() => expect(ctx.cryptoState).toBe('locked'));
  });

  it('starts a new session when another window finished setting up', async () => {
    vi.mocked(setUpEncryption)
      .mockRejectedValueOnce(new CryptoConflict('set_up'))
      .mockResolvedValue('ready');

    await connectAndSync();

    await waitFor(() => expect(h.createClient).toHaveBeenCalledTimes(2));
    expect(matrixSession).toHaveBeenCalledTimes(2);
  });

  it('asks again once the other window lease runs out', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    vi.mocked(setUpEncryption)
      .mockRejectedValueOnce(new CryptoConflict('in_progress', 5))
      .mockResolvedValue('ready');

    await connectAndSync();
    expect(setUpEncryption).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(setUpEncryption).toHaveBeenCalledTimes(2);
    expect(ctx.cryptoState).toBe('ready');
  });

  it('waits for the encryption setup before stopping the client', async () => {
    let finish: (state: 'ready') => void = () => undefined;
    vi.mocked(setUpEncryption).mockImplementation(
      () => new Promise((resolve) => (finish = resolve)),
    );
    await connectAndSync();
    const client = h.client;

    act(() => ctx.disconnect());
    expect(client.stopClient).not.toHaveBeenCalled();

    await act(async () => {
      finish('ready');
      await Promise.resolve();
    });
    expect(client.stopClient).toHaveBeenCalled();
  });

  it('resets a locked identity on request', async () => {
    vi.mocked(setUpEncryption).mockResolvedValue('locked');
    vi.mocked(resetEncryption).mockResolvedValue(undefined);
    await connectAndSync();
    await waitFor(() => expect(ctx.cryptoState).toBe('locked'));

    await act(() => ctx.resetCryptoIdentity());

    expect(resetEncryption).toHaveBeenCalledWith(h.client, expect.anything());
    expect(ctx.cryptoState).toBe('ready');
  });

  it('restarts for another window at most once a minute', async () => {
    vi.mocked(setUpEncryption).mockRejectedValue(new CryptoConflict('set_up'));

    await connectAndSync();
    await waitFor(() => expect(h.createClient).toHaveBeenCalledTimes(2));
    await act(async () => {
      await h.client.handlers.sync('PREPARED');
    });

    await waitFor(() => expect(ctx.cryptoState).toBe('error'));
    expect(h.createClient).toHaveBeenCalledTimes(2);
  });

  it('restarts when another window set encryption up while this one waited', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    vi.mocked(setUpEncryption)
      .mockRejectedValueOnce(new CryptoConflict('in_progress', 5))
      .mockResolvedValueOnce('locked')
      .mockResolvedValue('ready');

    await connectAndSync();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    // Not a false "locked": a new session brings the other window's key.
    expect(h.createClient).toHaveBeenCalledTimes(2);
    expect(ctx.cryptoState).not.toBe('locked');
  });

  it('stops a client whose encryption setup hangs, after a bounded wait', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    vi.mocked(setUpEncryption).mockImplementation(() => new Promise(() => {}));
    await connectAndSync();
    const client = h.client;
    client.http = { abort: vi.fn() };
    client.syncApi = { stop: vi.fn() };

    act(() => ctx.disconnect());
    expect(client.syncApi.stop).toHaveBeenCalled();
    expect(client.http.abort).toHaveBeenCalled();
    expect(client.stopClient).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(client.stopClient).toHaveBeenCalled();
  });
});
