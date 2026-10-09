import { describe, expect, it } from 'vitest';

import { findActiveFocus, parseCallMembers } from './parseCallMembers';

const CALL_MEMBER_EVENT = 'org.matrix.msc3401.call.member';

function buildEvent(senderId: string | null, memberships: any[]) {
  return {
    getContent: () => ({ memberships }),
    getSender: () => senderId,
  };
}

function buildSessionEvent(senderId: string, content: any, ts = 0) {
  return {
    getContent: () => content,
    getSender: () => senderId,
    getTs: () => ts,
  };
}

function buildRoom(events: any[]) {
  return {
    currentState: {
      getStateEvents: (type: string) =>
        type === CALL_MEMBER_EVENT ? events : [],
    },
  } as any;
}

describe('parseCallMembers', () => {
  it('returns empty array when no events present', () => {
    const room = buildRoom([]);
    expect(parseCallMembers(room, 0)).toEqual([]);
  });

  it('returns active memberships with expiry derived from created_ts + expires', () => {
    const now = 1_000_000;
    const room = buildRoom([
      buildEvent('@alice:localhost', [
        { device_id: 'dev1', created_ts: now - 1000, expires: 60_000 },
      ]),
    ]);
    expect(parseCallMembers(room, now)).toEqual([
      {
        userId: '@alice:localhost',
        deviceId: 'dev1',
        expiresAt: now - 1000 + 60_000,
      },
    ]);
  });

  it('drops memberships whose expiry has passed', () => {
    const now = 1_000_000;
    const room = buildRoom([
      buildEvent('@alice:localhost', [
        { device_id: 'dev1', created_ts: now - 120_000, expires: 60_000 },
      ]),
    ]);
    expect(parseCallMembers(room, now)).toEqual([]);
  });

  it('uses default 1h expiry when expires is missing', () => {
    const now = 1_000_000;
    const room = buildRoom([
      buildEvent('@alice:localhost', [
        { device_id: 'dev1', created_ts: now - 1000 },
      ]),
    ]);
    const result = parseCallMembers(room, now);
    expect(result).toHaveLength(1);
    expect(result[0].expiresAt).toBe(now - 1000 + 60 * 60 * 1000);
  });

  it('skips memberships without created_ts', () => {
    const room = buildRoom([
      buildEvent('@alice:localhost', [{ device_id: 'dev1' }]),
    ]);
    expect(parseCallMembers(room, 0)).toEqual([]);
  });

  it('handles multiple memberships per sender', () => {
    const now = 1_000_000;
    const room = buildRoom([
      buildEvent('@alice:localhost', [
        { device_id: 'dev1', created_ts: now, expires: 60_000 },
        { device_id: 'dev2', created_ts: now, expires: 60_000 },
      ]),
    ]);
    expect(parseCallMembers(room, now).map((m) => m.deviceId)).toEqual([
      'dev1',
      'dev2',
    ]);
  });

  it('skips events without a sender', () => {
    const room = buildRoom([
      buildEvent(null, [{ device_id: 'dev1', created_ts: 1, expires: 60_000 }]),
    ]);
    expect(parseCallMembers(room, 1)).toEqual([]);
  });

  describe('per-device (MSC4143) layout', () => {
    const now = 1_000_000;
    const session = (deviceId: string, extra: any = {}) => ({
      application: 'm.call',
      call_id: '',
      scope: 'm.room',
      device_id: deviceId,
      created_ts: now - 1000,
      expires: 60_000,
      focus_active: { type: 'livekit' },
      ...extra,
    });

    it('reads one membership per state event', () => {
      const room = buildRoom([
        buildSessionEvent('@alice:localhost', session('dev1')),
        buildSessionEvent('@alice:localhost', session('dev2')),
      ]);
      expect(parseCallMembers(room, now)).toEqual([
        {
          userId: '@alice:localhost',
          deviceId: 'dev1',
          expiresAt: now + 59_000,
        },
        {
          userId: '@alice:localhost',
          deviceId: 'dev2',
          expiresAt: now + 59_000,
        },
      ]);
    });

    it('treats empty content as a device that left', () => {
      const room = buildRoom([buildSessionEvent('@alice:localhost', {})]);
      expect(parseCallMembers(room, now)).toEqual([]);
    });

    it('falls back to the event time when created_ts is missing', () => {
      const room = buildRoom([
        buildSessionEvent(
          '@alice:localhost',
          session('dev1', { created_ts: undefined }),
          now - 5000,
        ),
      ]);
      expect(parseCallMembers(room, now)[0].expiresAt).toBe(now + 55_000);
    });

    it('drops expired memberships and other applications', () => {
      const room = buildRoom([
        buildSessionEvent(
          '@alice:localhost',
          session('dev1', { created_ts: now - 120_000 }),
        ),
        buildSessionEvent(
          '@bob:localhost',
          session('dev2', { application: 'com.example.game' }),
        ),
      ]);
      expect(parseCallMembers(room, now)).toEqual([]);
    });

    it('reads legacy and per-device events side by side, once per device', () => {
      const room = buildRoom([
        buildEvent('@alice:localhost', [
          { device_id: 'dev1', created_ts: now - 1000, expires: 30_000 },
        ]),
        buildSessionEvent('@alice:localhost', session('dev1')),
        buildEvent('@bob:localhost', [
          { device_id: 'dev9', created_ts: now - 1000, expires: 30_000 },
        ]),
      ]);
      expect(parseCallMembers(room, now)).toEqual([
        {
          userId: '@alice:localhost',
          deviceId: 'dev1',
          expiresAt: now + 59_000,
        },
        { userId: '@bob:localhost', deviceId: 'dev9', expiresAt: now + 29_000 },
      ]);
    });
  });

  describe('malformed numbers from other members', () => {
    const now = 1_000_000;
    it.each([
      ['string expires', { created_ts: now - 1000, expires: 'x' }],
      ['NaN-like created_ts', { created_ts: 'y', expires: 60_000 }],
      ['infinite expires', { created_ts: now - 1000, expires: Infinity }],
      ['negative expires', { created_ts: now - 1000, expires: -5 }],
    ])('skips a per-device membership with %s', (_, extra) => {
      const room = buildRoom([
        buildSessionEvent('@alice:localhost', {
          application: 'm.call',
          call_id: '',
          device_id: 'dev1',
          focus_active: { type: 'livekit' },
          ...extra,
        }),
      ]);
      expect(parseCallMembers(room, now)).toEqual([]);
    });

    it('skips legacy entries with non-numeric fields', () => {
      const room = buildRoom([
        buildEvent('@alice:localhost', [
          { device_id: 'dev1', created_ts: now - 1000, expires: 'x' },
          { device_id: 'dev2', created_ts: 'z', expires: 60_000 },
          { device_id: 'dev3', created_ts: now - 1000, expires: 60_000 },
        ]),
      ]);
      expect(parseCallMembers(room, now).map((m) => m.deviceId)).toEqual([
        'dev3',
      ]);
    });
  });
});

// What Element Call (matrix-js-sdk 40 MembershipManager, compatibility mode)
// writes under `_@user:server_DEVICE_m.call`.
const elementMembership = (overrides: any = {}) => ({
  application: 'm.call',
  call_id: '',
  scope: 'm.room',
  device_id: 'ELEMENTDEV',
  membershipID: '@drawerb:localhost:ELEMENTDEV',
  expires: 14_400_000,
  'm.call.intent': 'video',
  focus_active: { type: 'livekit', focus_selection: 'multi_sfu' },
  foci_preferred: [
    { type: 'livekit', livekit_service_url: 'https://hs.test/livekit' },
  ],
  ...overrides,
});

describe('Element Call memberships', () => {
  const now = 1_000_000;

  it('lists an Element Call device, its first publish having no created_ts', () => {
    const room = buildRoom([
      buildSessionEvent('@drawerb:localhost', elementMembership(), now - 5),
    ]);
    expect(parseCallMembers(room, now)).toEqual([
      {
        userId: '@drawerb:localhost',
        deviceId: 'ELEMENTDEV',
        expiresAt: now - 5 + 14_400_000,
      },
    ]);
  });

  it('ignores memberships of another call in the room', () => {
    const room = buildRoom([
      buildSessionEvent(
        '@drawerb:localhost',
        elementMembership({ call_id: 'breakout' }),
        now - 5,
      ),
    ]);
    expect(parseCallMembers(room, now)).toEqual([]);
  });

  it("follows the oldest member's preferred focus", () => {
    const room = buildRoom([
      buildSessionEvent(
        '@owner:localhost',
        {
          ...elementMembership({ device_id: 'WALDUR', created_ts: now - 10 }),
          focus_active: {
            type: 'livekit',
            focus_selection: 'oldest_membership',
          },
          foci_preferred: [],
        },
        now,
      ),
      buildSessionEvent(
        '@drawerb:localhost',
        elementMembership({ created_ts: now - 100 }),
        now,
      ),
    ]);
    expect(findActiveFocus(room, now)).toEqual({
      type: 'livekit',
      livekit_service_url: 'https://hs.test/livekit',
    });
  });

  it('has no active focus when the oldest member advertises none', () => {
    const room = buildRoom([
      buildSessionEvent(
        '@owner:localhost',
        elementMembership({ created_ts: now - 100, foci_preferred: [] }),
        now,
      ),
      buildSessionEvent(
        '@drawerb:localhost',
        elementMembership({ created_ts: now - 10 }),
        now,
      ),
    ]);
    expect(findActiveFocus(room, now)).toBeNull();
  });

  it('skips our own device when choosing the focus', () => {
    const room = buildRoom([
      buildSessionEvent(
        '@drawerb:localhost',
        elementMembership({ created_ts: now - 100 }),
        now,
      ),
    ]);
    expect(
      findActiveFocus(room, now, {
        userId: '@drawerb:localhost',
        deviceId: 'ELEMENTDEV',
      }),
    ).toBeNull();
  });

  it('ignores a membership claiming to be valid far into the future', () => {
    const room = buildRoom([
      buildSessionEvent(
        '@mallory:localhost',
        elementMembership({
          device_id: 'MALLORY',
          created_ts: 1,
          expires: 1e15,
          foci_preferred: [
            { type: 'livekit', livekit_service_url: 'https://evil.test' },
          ],
        }),
        now,
      ),
      buildSessionEvent(
        '@drawerb:localhost',
        elementMembership({ created_ts: now - 100 }),
        now,
      ),
    ]);
    expect(findActiveFocus(room, now)).toEqual({
      type: 'livekit',
      livekit_service_url: 'https://hs.test/livekit',
    });
    expect(parseCallMembers(room, now).map((m) => m.deviceId)).toEqual([
      'ELEMENTDEV',
    ]);
  });

  it('ignores a membership created in the future', () => {
    const room = buildRoom([
      buildSessionEvent(
        '@mallory:localhost',
        elementMembership({
          device_id: 'MALLORY',
          created_ts: now + 60 * 60 * 1000,
          expires: 1000,
        }),
        now,
      ),
    ]);
    expect(findActiveFocus(room, now)).toBeNull();
    expect(parseCallMembers(room, now)).toEqual([]);
  });

  it('ignores a legacy membership valid far into the future', () => {
    const room = buildRoom([
      buildEvent('@mallory:localhost', [
        { device_id: 'dev1', created_ts: 1, expires: 1e15 },
      ]),
    ]);
    expect(parseCallMembers(room, now)).toEqual([]);
  });

  it('keeps a long call whose refreshed expiry is near', () => {
    const hour = 60 * 60 * 1000;
    const later = 1_700_000_000_000;
    const room = buildRoom([
      buildSessionEvent(
        '@drawerb:localhost',
        elementMembership({ created_ts: later - 5 * hour, expires: 6 * hour }),
        later,
      ),
    ]);
    expect(findActiveFocus(room, later)).not.toBeNull();
    expect(parseCallMembers(room, later)).toHaveLength(1);
  });
});
