import { EventEmitter } from 'events';

import { KeyProviderEvent } from 'livekit-client';
import { describe, expect, it, vi } from 'vitest';

import { MatrixKeyProvider } from './MatrixKeyProvider';

const KEY_CHANGED = 'encryption_key_changed';

const fakeSession = () => {
  const session: any = new EventEmitter();
  session.reemitEncryptionKeys = vi.fn();
  return session;
};

const key = (byte: number) => new Uint8Array(16).fill(byte);

describe('MatrixKeyProvider', () => {
  it("sets each member's key for their LiveKit identity and index", async () => {
    const provider = new MatrixKeyProvider('@me:s:ME');
    const setKey = vi.fn();
    provider.on(KeyProviderEvent.SetKey, setKey);
    const session = fakeSession();

    provider.setSource(session);
    session.emit(KEY_CHANGED, key(1), 3, {}, '@a:s:A');

    await vi.waitFor(() => expect(setKey).toHaveBeenCalledTimes(1));
    expect(setKey.mock.calls[0][0]).toMatchObject({
      participantIdentity: '@a:s:A',
      keyIndex: 3,
    });
    expect(provider.getOptions()).toMatchObject({ keyringSize: 256 });
  });

  it('encrypts with our own newest key after reconnecting', async () => {
    const provider = new MatrixKeyProvider('@me:s:ME');
    const setKey = vi.fn();
    provider.on(KeyProviderEvent.SetKey, setKey);
    const session = fakeSession();
    provider.setSource(session);

    session.emit(KEY_CHANGED, key(1), 1, {}, '@me:s:ME');
    // Another member's key lands after our rotation.
    session.emit(KEY_CHANGED, key(2), 0, {}, '@a:s:A');

    await vi.waitFor(() => expect(setKey).toHaveBeenCalledTimes(2));
    expect(provider.getLatestManuallySetKeyIndex()).toBe(1);
  });

  it('asks the session for the keys it already holds', () => {
    const provider = new MatrixKeyProvider('@me:s:ME');
    const session = fakeSession();

    provider.setSource(session);

    expect(session.reemitEncryptionKeys).toHaveBeenCalledTimes(1);
  });

  it('stops taking keys from a session it was detached from', async () => {
    const provider = new MatrixKeyProvider('@me:s:ME');
    const setKey = vi.fn();
    provider.on(KeyProviderEvent.SetKey, setKey);
    const session = fakeSession();
    provider.setSource(session);

    session.emit(KEY_CHANGED, key(1), 0, {}, '@a:s:A');
    provider.setSource(null);
    session.emit(KEY_CHANGED, key(2), 1, {}, '@a:s:A');
    await new Promise((r) => setTimeout(r, 10));

    expect(setKey).not.toHaveBeenCalled();
    expect(session.listenerCount(KEY_CHANGED)).toBe(0);
  });
});
