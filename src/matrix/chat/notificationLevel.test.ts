import { describe, expect, it, vi } from 'vitest';

import {
  getRoomNotificationLevel,
  NOTIFICATION_LEVEL_EVENT_TYPE,
  setRoomNotificationLevel,
} from './notificationLevel';

const ROOM = '!r:x';

// Element mutes a room with an override rule named after it that does nothing.
const MUTE_OVERRIDE = {
  rule_id: ROOM,
  actions: [],
  conditions: [{ kind: 'event_match', key: 'room_id', pattern: ROOM }],
  default: false,
  enabled: true,
};

// What this app's Mute wrote before: mentions still get through it.
const LEGACY_MUTE = {
  rule_id: ROOM,
  actions: ['dont_notify'],
  default: false,
  enabled: true,
};

const makeClient = ({
  synced = true,
  override = [] as any[],
  roomRule = undefined as any,
  level = undefined as string | undefined,
  // What the server holds, which a reload brings into the client.
  serverRules = undefined as any,
} = {}) => {
  const room = {
    getAccountData: vi.fn((type: string) =>
      type === NOTIFICATION_LEVEL_EVENT_TYPE && level
        ? { getContent: () => ({ level }) }
        : undefined,
    ),
  };
  const client = {
    isInitialSyncComplete: () => synced,
    pushRules: { global: { override } },
    getRoomPushRule: vi.fn(() => roomRule),
    getRoom: vi.fn(() => room),
    addPushRule: vi.fn().mockResolvedValue({}),
    deletePushRule: vi.fn().mockResolvedValue({}),
    setRoomAccountData: vi.fn().mockResolvedValue({}),
    // As the SDK's: the fetched rules replace the client's.
    getPushRules: vi.fn(() => {
      if (serverRules) client.pushRules = serverRules;
      return Promise.resolve(client.pushRules);
    }),
  } as any;
  return client;
};

describe('getRoomNotificationLevel', () => {
  it('reads mentions by default', () => {
    expect(getRoomNotificationLevel(makeClient(), ROOM)).toBe('mentions');
  });

  // The SDK throws on push rules read before the initial sync.
  it('reads mentions before the initial sync completes', () => {
    const client = makeClient({ synced: false, override: [MUTE_OVERRIDE] });
    expect(getRoomNotificationLevel(client, ROOM)).toBe('mentions');
    expect(client.getRoomPushRule).not.toHaveBeenCalled();
  });

  it('reads mentions without a client or room', () => {
    expect(getRoomNotificationLevel(null, ROOM)).toBe('mentions');
    expect(getRoomNotificationLevel(makeClient(), null)).toBe('mentions');
  });

  it('reads mute from an override rule', () => {
    const client = makeClient({ override: [MUTE_OVERRIDE] });
    expect(getRoomNotificationLevel(client, ROOM)).toBe('mute');
  });

  it('does not read an override rule that notifies as mute', () => {
    const client = makeClient({
      override: [{ ...MUTE_OVERRIDE, actions: ['notify'] }],
    });
    expect(getRoomNotificationLevel(client, ROOM)).toBe('mentions');
  });

  it("reads today's room-kind mute rule as mute", () => {
    const client = makeClient({ roomRule: LEGACY_MUTE });
    expect(getRoomNotificationLevel(client, ROOM)).toBe('mute');
  });

  it('reads all from room account data', () => {
    const client = makeClient({ level: 'all' });
    expect(getRoomNotificationLevel(client, ROOM)).toBe('all');
  });

  // Muting leaves the stored level in place.
  it('reads mute over a stored all', () => {
    const client = makeClient({ override: [MUTE_OVERRIDE], level: 'all' });
    expect(getRoomNotificationLevel(client, ROOM)).toBe('mute');
  });
});

describe('setRoomNotificationLevel', () => {
  it('muting adds an override rule and removes the legacy room rule', async () => {
    const client = makeClient({ roomRule: LEGACY_MUTE });
    await setRoomNotificationLevel(client, ROOM, 'mute');
    expect(client.addPushRule).toHaveBeenCalledWith(
      'global',
      'override',
      ROOM,
      {
        actions: [],
        conditions: [{ kind: 'event_match', key: 'room_id', pattern: ROOM }],
      },
    );
    expect(client.deletePushRule).toHaveBeenCalledWith('global', 'room', ROOM);
  });

  // The server refuses to delete a rule that is not there.
  it('muting deletes no rule that is not there', async () => {
    const client = makeClient();
    await setRoomNotificationLevel(client, ROOM, 'mute');
    expect(client.deletePushRule).not.toHaveBeenCalled();
  });

  // A second pick before the next sync must see the first one's rules.
  it('refreshes the push rules after changing them', async () => {
    const client = makeClient({
      serverRules: { global: { override: [MUTE_OVERRIDE] } },
    });
    await setRoomNotificationLevel(client, ROOM, 'mute');
    await setRoomNotificationLevel(client, ROOM, 'all');
    expect(client.deletePushRule).toHaveBeenCalledWith(
      'global',
      'override',
      ROOM,
    );
  });

  // A retry after a partial failure must not read the rules from before it.
  it('refreshes the push rules after a failed change too', async () => {
    const client = makeClient({ roomRule: LEGACY_MUTE });
    client.deletePushRule.mockRejectedValue(new Error('offline'));
    await expect(
      setRoomNotificationLevel(client, ROOM, 'mute'),
    ).rejects.toThrow('offline');
    expect(client.getPushRules).toHaveBeenCalled();
  });

  // The change itself went through; the next sync brings the rules anyway.
  it('ignores a failed refresh', async () => {
    const client = makeClient();
    client.getPushRules.mockRejectedValue(new Error('offline'));
    await expect(
      setRoomNotificationLevel(client, ROOM, 'mute'),
    ).resolves.toBeUndefined();
  });

  it('switching from mute to all removes the override rule and stores the level', async () => {
    const client = makeClient({ override: [MUTE_OVERRIDE] });
    await setRoomNotificationLevel(client, ROOM, 'all');
    expect(client.deletePushRule).toHaveBeenCalledWith(
      'global',
      'override',
      ROOM,
    );
    expect(client.deletePushRule).toHaveBeenCalledTimes(1);
    expect(client.setRoomAccountData).toHaveBeenCalledWith(
      ROOM,
      'com.waldur.notification_level',
      { level: 'all' },
    );
  });

  it("switching from today's mute to mentions removes the legacy rule", async () => {
    const client = makeClient({ roomRule: LEGACY_MUTE });
    await setRoomNotificationLevel(client, ROOM, 'mentions');
    expect(client.deletePushRule).toHaveBeenCalledWith('global', 'room', ROOM);
    expect(client.deletePushRule).toHaveBeenCalledTimes(1);
    expect(client.setRoomAccountData).toHaveBeenCalledWith(
      ROOM,
      'com.waldur.notification_level',
      { level: 'mentions' },
    );
  });
});
