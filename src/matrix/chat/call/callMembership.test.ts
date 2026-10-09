import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CALL_MEMBER_EVENT,
  makeCallMemberStateKey,
  MEMBERSHIP_EXPIRY_MS,
  MEMBERSHIP_REFRESH_HEADROOM_MS,
  MEMBERSHIP_REFRESH_RETRY_MS,
  startMembershipRefresh,
  timerDelay,
} from './callMembership';
import { parseCallMembers } from './parseCallMembers';
import { announceCallJoin, announceCallLeave } from './useCallMemberEvents';

describe('makeCallMemberStateKey', () => {
  it('uses the MSC4143 per-device layout matrix-js-sdk writes', () => {
    expect(makeCallMemberStateKey('@alice:example.org', 'DEV1')).toBe(
      '_@alice:example.org_DEV1_m.call',
    );
  });

  it('drops the leading underscore in rooms with owned state keys', () => {
    expect(
      makeCallMemberStateKey(
        '@alice:example.org',
        'DEV1',
        'org.matrix.msc3757.11',
      ),
    ).toBe('@alice:example.org_DEV1_m.call');
  });

  it('gives two devices of one user different keys', () => {
    expect(makeCallMemberStateKey('@a:s', 'DEV1')).not.toBe(
      makeCallMemberStateKey('@a:s', 'DEV2'),
    );
  });
});

describe('timerDelay', () => {
  it('never returns a delay that would make setTimeout fire at once', () => {
    expect(timerDelay(NaN)).toBe(2 ** 31 - 1);
    expect(timerDelay(Infinity)).toBe(2 ** 31 - 1);
    expect(timerDelay(-Infinity)).toBe(2 ** 31 - 1);
    expect(timerDelay(1e12)).toBe(2 ** 31 - 1);
    expect(timerDelay(-50)).toBe(1000);
    expect(timerDelay(0)).toBe(1000);
    expect(timerDelay(60_000)).toBe(60_000);
  });
});

describe('startMembershipRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000_000);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('re-sends once, shortly before expiry, keeping the join time', async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const createdTs = Date.now();
    const stop = startMembershipRefresh(
      { createdTs, expires: MEMBERSHIP_EXPIRY_MS },
      send,
    );

    await vi.advanceTimersByTimeAsync(
      MEMBERSHIP_EXPIRY_MS - MEMBERSHIP_REFRESH_HEADROOM_MS - 1,
    );
    expect(send).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenLastCalledWith({
      createdTs,
      expires: 2 * MEMBERSHIP_EXPIRY_MS - MEMBERSHIP_REFRESH_HEADROOM_MS,
    });

    // Each refresh extends validity to a full period from now, and the next
    // one again comes the headroom before that.
    await vi.advanceTimersByTimeAsync(
      MEMBERSHIP_EXPIRY_MS - MEMBERSHIP_REFRESH_HEADROOM_MS - 1,
    );
    expect(send).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(send).toHaveBeenCalledTimes(2);

    stop();
    await vi.advanceTimersByTimeAsync(10 * MEMBERSHIP_EXPIRY_MS);
    expect(send).toHaveBeenCalledTimes(2);
  });

  it('sends O(1) events per hour, not one per heartbeat', async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const stop = startMembershipRefresh(
      { createdTs: Date.now(), expires: MEMBERSHIP_EXPIRY_MS },
      send,
    );
    await vi.advanceTimersByTimeAsync(3 * 60 * 60 * 1000);
    expect(send.mock.calls.length).toBeLessThanOrEqual(3);
    stop();
  });

  it('retries after a failed send', async () => {
    const send = vi
      .fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValue(undefined);
    const stop = startMembershipRefresh(
      { createdTs: Date.now(), expires: MEMBERSHIP_EXPIRY_MS },
      send,
    );
    await vi.advanceTimersByTimeAsync(
      MEMBERSHIP_EXPIRY_MS - MEMBERSHIP_REFRESH_HEADROOM_MS,
    );
    expect(send).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(MEMBERSHIP_REFRESH_RETRY_MS);
    expect(send).toHaveBeenCalledTimes(2);
    stop();
  });
});

// A homeserver stand-in: room state keyed by (type, state_key), as Matrix
// stores it, so a write to one key replaces only that key's event.
function fakeClient(userId: string) {
  const state = new Map<string, any>();
  const room = {
    getVersion: () => '11',
    currentState: {
      getStateEvents: (type: string) =>
        Array.from(state.values()).filter((e) => e.getType() === type),
    },
  };
  return {
    getUserId: () => userId,
    getRoom: () => room,
    room,
    state,
    sendStateEvent: vi.fn(
      (_roomId: string, type: string, content: any, stateKey: string) => {
        state.set(`${type}|${stateKey}`, {
          getType: () => type,
          getSender: () => userId,
          getStateKey: () => stateKey,
          getContent: () => content,
          getTs: () => Date.now(),
        });
        return Promise.resolve();
      },
    ),
  };
}

describe('announcing call membership', () => {
  it('keeps two devices of the same user side by side', async () => {
    const client = fakeClient('@alice:s');
    const timing = { createdTs: Date.now(), expires: MEMBERSHIP_EXPIRY_MS };

    await announceCallJoin(client, '!r:s', 'DEV1', timing);
    await announceCallJoin(client, '!r:s', 'DEV2', timing);

    expect(client.sendStateEvent.mock.calls.map((c) => c[3])).toEqual([
      '_@alice:s_DEV1_m.call',
      '_@alice:s_DEV2_m.call',
    ]);
    expect(
      parseCallMembers(client.room as any, Date.now()).map((m) => m.deviceId),
    ).toEqual(['DEV1', 'DEV2']);

    // One device leaving clears its own key only.
    await announceCallLeave(client, '!r:s', 'DEV1');
    expect(client.sendStateEvent).toHaveBeenLastCalledWith(
      '!r:s',
      CALL_MEMBER_EVENT,
      {},
      '_@alice:s_DEV1_m.call',
    );
    expect(
      parseCallMembers(client.room as any, Date.now()).map((m) => m.deviceId),
    ).toEqual(['DEV2']);
  });

  it('publishes a matrix-js-sdk style session membership', async () => {
    const client = fakeClient('@alice:s');
    await announceCallJoin(client, '!r:s', 'DEV1', {
      createdTs: 123,
      expires: MEMBERSHIP_EXPIRY_MS,
    });
    expect(client.sendStateEvent.mock.calls[0][2]).toMatchObject({
      application: 'm.call',
      call_id: '',
      scope: 'm.room',
      device_id: 'DEV1',
      created_ts: 123,
      expires: MEMBERSHIP_EXPIRY_MS,
      focus_active: { type: 'livekit' },
    });
  });
});
