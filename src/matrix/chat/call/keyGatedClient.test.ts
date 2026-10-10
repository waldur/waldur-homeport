import { EventEmitter } from 'events';

import { ClientEvent } from 'matrix-js-sdk';
import { describe, expect, it, vi } from 'vitest';

import {
  CALL_KEYS_EVENT,
  checkCallKey,
  keyGatedClient,
} from './keyGatedClient';

const ROOM = '!r:s';

const callKey = (
  sender: string,
  claimedDevice: string,
  encryptionInfo: any = {
    sender,
    senderDevice: claimedDevice,
    senderCurve25519KeyBase64: 'curve',
  },
  { roomId = ROOM, index = 0 } = {},
) => ({
  message: {
    type: CALL_KEYS_EVENT,
    sender,
    content: {
      keys: { index, key: 'a2V5' },
      room_id: roomId,
      member: { claimed_device_id: claimedDevice, id: `${sender}:x` },
    },
  },
  encryptionInfo,
});

// A client whose crypto knows `devices` (device id → Curve25519 key) of
// every user; `getUserDeviceInfo` is a spy.
const fakeClient = (devices: Record<string, string> = {}) => {
  const client: any = new EventEmitter();
  const getUserDeviceInfo = vi.fn((users: string[]) =>
    Promise.resolve(
      new Map([
        [
          users[0],
          new Map(
            Object.entries(devices).map(([deviceId, curve]) => [
              deviceId,
              { deviceId, getIdentityKey: () => curve },
            ]),
          ),
        ],
      ]),
    ),
  );
  client.getCrypto = () => ({ getUserDeviceInfo });
  client.getRoom = () => ({
    getMember: (userId: string) =>
      userId.startsWith('@outsider') ? null : { membership: 'join' },
  });
  client.known = devices;
  client.getUserDeviceInfo = getUserDeviceInfo;
  return client;
};

const unknownDevice = (sender: string, curve: string) => ({
  sender,
  senderCurve25519KeyBase64: curve,
});

describe('checkCallKey', () => {
  it('accepts a key the claimed device sent over Olm', async () => {
    expect(await checkCallKey(fakeClient(), ROOM, callKey('@a:s', 'A'))).toBe(
      'authentic',
    );
  });

  it('refuses a key sent in clear', async () => {
    expect(
      await checkCallKey(fakeClient(), ROOM, callKey('@a:s', 'A', null)),
    ).toBe('forged');
  });

  it('refuses a key for the call of another room', async () => {
    const other = callKey('@a:s', 'A', undefined, { roomId: '!other:s' });
    expect(await checkCallKey(fakeClient(), ROOM, other)).toBe('forged');
  });

  it("refuses a key claimed for another of the sender's devices", async () => {
    const forged = callKey('@a:s', 'B', {
      sender: '@a:s',
      senderDevice: 'A',
      senderCurve25519KeyBase64: 'curve',
    });
    expect(await checkCallKey(fakeClient(), ROOM, forged)).toBe('forged');
  });

  it('refuses a key whose Olm sender is another user', async () => {
    const forged = callKey('@a:s', 'A', {
      sender: '@mallory:s',
      senderDevice: 'A',
      senderCurve25519KeyBase64: 'curve',
    });
    expect(await checkCallKey(fakeClient(), ROOM, forged)).toBe('forged');
  });

  it('finds the sending device among known ones by its Curve25519 key', async () => {
    const client = fakeClient({ A: 'curve-a', B: 'curve-b' });
    const info = unknownDevice('@a:s', 'curve-a');

    expect(await checkCallKey(client, ROOM, callKey('@a:s', 'A', info))).toBe(
      'authentic',
    );
    expect(await checkCallKey(client, ROOM, callKey('@a:s', 'B', info))).toBe(
      'forged',
    );
    // Only what crypto already holds: nothing is fetched for the sender.
    expect(client.getUserDeviceInfo).toHaveBeenCalledWith(['@a:s'], false);
  });

  it('reports a sending device that is not known yet', async () => {
    const info = unknownDevice('@a:s', 'curve-new');
    expect(
      await checkCallKey(fakeClient(), ROOM, callKey('@a:s', 'A', info)),
    ).toBe('unknown-device');
  });
});

describe('keyGatedClient', () => {
  const received = (listener: ReturnType<typeof vi.fn>) =>
    listener.mock.calls.map(([event]) => [
      event.getSender(),
      event.getContent().keys.index,
    ]);

  it('hands the key transport only authentic keys, in arrival order', async () => {
    const client = fakeClient({ A: 'curve-a' });
    const gated = keyGatedClient(client, ROOM);
    const listener = vi.fn();
    gated.on(ClientEvent.ToDeviceEvent, listener);

    const emit = (message: any) =>
      client.emit(ClientEvent.ReceivedToDeviceMessage, message);
    // The first goes through the device lookup, the later ones don't.
    emit(callKey('@a:s', 'A', unknownDevice('@a:s', 'curve-a')));
    emit(callKey('@a:s', 'A', null, { index: 9 }));
    emit(callKey('@a:s', 'A', undefined, { index: 1 }));
    emit(callKey('@a:s', 'A', undefined, { index: 2 }));
    // The deprecated event the transport would otherwise hear is not passed on.
    client.emit(ClientEvent.ToDeviceEvent, { getType: () => CALL_KEYS_EVENT });

    await vi.waitFor(() => expect(listener).toHaveBeenCalledTimes(3));
    expect(received(listener)).toEqual([
      ['@a:s', 0],
      ['@a:s', 1],
      ['@a:s', 2],
    ]);
    expect(listener.mock.calls[0][0].getType()).toBe(CALL_KEYS_EVENT);

    gated.off(ClientEvent.ToDeviceEvent, listener);
    expect(client.listenerCount(ClientEvent.ReceivedToDeviceMessage)).toBe(0);
    expect(client.listenerCount('crypto.devicesUpdated')).toBe(0);
  });

  it('keeps a key from a device not known yet until the device turns up', async () => {
    const client = fakeClient();
    const gated = keyGatedClient(client, ROOM);
    const listener = vi.fn();
    gated.on(ClientEvent.ToDeviceEvent, listener);

    client.emit(
      ClientEvent.ReceivedToDeviceMessage,
      callKey('@a:s', 'A', unknownDevice('@a:s', 'curve-a')),
    );
    await new Promise((r) => setTimeout(r, 10));
    expect(listener).not.toHaveBeenCalled();

    client.known.A = 'curve-a';
    client.getUserDeviceInfo.mockImplementation((users: string[]) =>
      Promise.resolve(
        new Map([
          [
            users[0],
            new Map([
              ['A', { deviceId: 'A', getIdentityKey: () => 'curve-a' }],
            ]),
          ],
        ]),
      ),
    );
    client.emit('crypto.devicesUpdated', ['@a:s'], false);

    await vi.waitFor(() => expect(listener).toHaveBeenCalledTimes(1));
    expect(received(listener)).toEqual([['@a:s', 0]]);
  });

  it('keeps few keys waiting from outside the room', async () => {
    const client = fakeClient();
    const gated = keyGatedClient(client, ROOM);
    gated.on(ClientEvent.ToDeviceEvent, vi.fn());

    const outsiders = Array.from({ length: 6 }, (_, n) => `@outsider${n}:s`);
    for (const sender of outsiders) {
      client.emit(
        ClientEvent.ReceivedToDeviceMessage,
        callKey(sender, 'A', unknownDevice(sender, 'curve-a')),
      );
    }
    await new Promise((r) => setTimeout(r, 10));
    client.getUserDeviceInfo.mockClear();
    client.emit('crypto.devicesUpdated', outsiders, false);
    await new Promise((r) => setTimeout(r, 10));

    // Only the latest few outsiders keep a place: someone about to join is
    // not kept out by those who came before.
    expect(
      client.getUserDeviceInfo.mock.calls.map(([users]) => users[0]),
    ).toEqual(outsiders.slice(2));
  });

  it('keeps waiting keys from a bounded number of senders only', async () => {
    const client = fakeClient();
    const gated = keyGatedClient(client, ROOM);
    gated.on(ClientEvent.ToDeviceEvent, vi.fn());

    for (let n = 0; n < 40; n++) {
      const sender = `@u${n}:s`;
      client.emit(
        ClientEvent.ReceivedToDeviceMessage,
        callKey(sender, 'A', unknownDevice(sender, 'curve-a')),
      );
    }
    await new Promise((r) => setTimeout(r, 10));
    client.getUserDeviceInfo.mockClear();
    client.emit(
      'crypto.devicesUpdated',
      Array.from({ length: 40 }, (_, n) => `@u${n}:s`),
      false,
    );
    await new Promise((r) => setTimeout(r, 10));

    // Only the first 32 senders' keys were kept to be checked again.
    expect(client.getUserDeviceInfo).toHaveBeenCalledTimes(32);
  });

  it('passes every other listener and method to the client', () => {
    const client = fakeClient();
    client.getUserId = () => '@me:s';
    const gated = keyGatedClient(client, ROOM);
    const listener = vi.fn();

    gated.on(ClientEvent.Sync, listener);
    client.emit(ClientEvent.Sync, 'PREPARED');

    expect(listener).toHaveBeenCalledWith('PREPARED');
    expect(gated.getUserId()).toBe('@me:s');
  });
});
