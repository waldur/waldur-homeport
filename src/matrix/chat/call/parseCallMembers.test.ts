import { describe, expect, it } from 'vitest';

import { parseCallMembers } from './parseCallMembers';

const CALL_MEMBER_EVENT = 'org.matrix.msc3401.call.member';

function buildEvent(senderId: string | null, memberships: any[]) {
  return {
    getContent: () => ({ memberships }),
    getSender: () => senderId,
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
});
