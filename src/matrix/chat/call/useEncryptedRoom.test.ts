import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
  rooms: [] as any[],
  workers: [] as any[],
  enable: () => Promise.resolve(),
}));

vi.mock('./e2eeWorker?worker', () => ({
  default: class {
    terminate = vi.fn();
    postMessage = vi.fn();
    constructor() {
      h.workers.push(this);
    }
  },
}));

vi.mock('livekit-client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('livekit-client')>()),
  Room: class {
    options: any;
    handlers = new Map<string, (...args: any[]) => void>();
    remoteParticipants = new Map<string, any>();
    localParticipant = { identity: '' };
    setE2EEEnabled = vi.fn(() => h.enable());
    disconnect = vi.fn(() => Promise.resolve());
    constructor(options: any) {
      this.options = options;
      h.rooms.push(this);
    }
    on(event: string, handler: any) {
      this.handlers.set(event, handler);
      return this;
    }
    off(event: string) {
      this.handlers.delete(event);
      return this;
    }
  },
}));

import { useEncryptedRoom } from './useEncryptedRoom';

const session = () => ({
  on: vi.fn(),
  off: vi.fn(),
  reemitEncryptionKeys: vi.fn(),
});

describe('useEncryptedRoom', () => {
  it('turns encryption on before handing out the room', async () => {
    h.rooms = [];
    const source = session();
    const { result, unmount } = renderHook(() =>
      useEncryptedRoom(true, source, '@me:s:ME', vi.fn()),
    );
    expect(result.current).toBeUndefined();

    await act(async () => {
      await Promise.resolve();
    });

    const [room] = h.rooms;
    expect(result.current).toBe(room);
    expect(room.setE2EEEnabled).toHaveBeenCalledWith(true);
    expect(room.options.e2ee.worker).toBe(h.workers.at(-1));
    // The worker learns who we are before anything else.
    expect(h.workers.at(-1).postMessage).toHaveBeenCalledWith({
      kind: 'waldurOwnIdentity',
      identity: '@me:s:ME',
    });
    expect(source.reemitEncryptionKeys).toHaveBeenCalled();

    unmount();
    await act(async () => {
      await Promise.resolve();
    });
    expect(room.disconnect).toHaveBeenCalled();
    expect(h.workers.at(-1).terminate).toHaveBeenCalled();
    expect(source.off).toHaveBeenCalled();
  });

  it('refuses tracks announced as unencrypted', async () => {
    h.rooms = [];
    const source = session();
    renderHook(() => useEncryptedRoom(true, source, '@me:s:ME', vi.fn()));
    await act(async () => {
      await Promise.resolve();
    });
    const [room] = h.rooms;
    const track = (isEncrypted: boolean) => ({
      isEncrypted,
      setSubscribed: vi.fn(),
    });

    // Published while we are in the call.
    const clear = track(false);
    const encrypted = track(true);
    room.handlers.get('trackPublished')(clear);
    room.handlers.get('trackPublished')(encrypted);
    // Already there when we (re)connect.
    const existing = track(false);
    room.remoteParticipants.set('@b:s:B', {
      trackPublications: new Map([['t', existing]]),
    });
    room.handlers.get('connectionStateChanged')('connected');

    expect(clear.setSubscribed).toHaveBeenCalledWith(false);
    expect(existing.setSubscribed).toHaveBeenCalledWith(false);
    expect(encrypted.setSubscribed).not.toHaveBeenCalled();
  });

  it('ends a call where the server names us someone else', async () => {
    h.rooms = [];
    const source = session();
    const onError = vi.fn();
    renderHook(() => useEncryptedRoom(true, source, '@me:s:ME', onError));
    await act(async () => {
      await Promise.resolve();
    });
    const [room] = h.rooms;

    room.localParticipant.identity = '@me:s:ME';
    room.handlers.get('signalConnected')();
    expect(onError).not.toHaveBeenCalled();

    room.localParticipant.identity = '@b:s:B';
    room.handlers.get('signalConnected')();
    expect(onError).toHaveBeenCalledTimes(1);
    // Named again on a full reconnect.
    room.handlers.get('reconnected')();
    expect(onError).toHaveBeenCalledTimes(2);
  });

  it('builds no room for a call that is not encrypted', () => {
    h.rooms = [];
    const { result } = renderHook(() =>
      useEncryptedRoom(false, session(), '@me:s:ME', vi.fn()),
    );
    expect(result.current).toBeUndefined();
    expect(h.rooms).toHaveLength(0);
  });

  it('reports a room that cannot turn encryption on', async () => {
    h.enable = () => Promise.reject(new Error('no e2ee'));
    const onError = vi.fn();
    renderHook(() => useEncryptedRoom(true, session(), '@me:s:ME', onError));
    await act(async () => {
      await Promise.resolve();
    });
    expect(onError).toHaveBeenCalledTimes(1);
    h.enable = () => Promise.resolve();
  });
});
