import { EventEmitter } from 'events';

import {
  ClientEvent,
  MatrixError,
  MatrixEvent,
  RoomStateEvent,
  UnsupportedDelayedEventsEndpointError,
} from 'matrix-js-sdk';
import { describe, expect, it, vi } from 'vitest';

import { CALL_MEMBER_EVENT } from './callMembership';
import { joinCallSession, sessionRoom } from './rtcSession';

const ROOM_ID = '!r:s';
const NOW = Date.now();

const memberEvent = (
  sender: string,
  deviceId: string,
  content: Record<string, unknown>,
) =>
  new MatrixEvent({
    type: CALL_MEMBER_EVENT,
    room_id: ROOM_ID,
    sender,
    state_key: `_${sender}_${deviceId}_m.call`,
    origin_server_ts: NOW,
    content,
  });

const membership = (deviceId: string, extra: Record<string, unknown> = {}) => ({
  application: 'm.call',
  call_id: '',
  scope: 'm.room',
  device_id: deviceId,
  focus_active: { type: 'livekit', focus_selection: 'oldest_membership' },
  foci_preferred: [],
  created_ts: NOW - 1000,
  expires: 60 * 60 * 1000,
  ...extra,
});

// A homeserver stand-in: room state keyed by state key, joined members, and a
// client that echoes each state event it sends back to its listeners, as
// sync would. The homeserver does not support delayed events (MSC4140).
function fakeHomeserver(userId = '@me:s', deviceId = 'DEV1') {
  const state = new Map<string, MatrixEvent>();
  const roomEvents = new EventEmitter();
  const room: any = {
    roomId: ROOM_ID,
    getVersion: () => '11',
    hasMembershipState: () => true,
    _unstable_getStickyEvents: () => [],
    getLiveTimeline: () => ({
      getState: () => ({
        getStateEvents: (type: string, stateKey?: string) => {
          const events = [...state.values()].filter(
            (e) => e.getType() === type,
          );
          return stateKey === undefined
            ? events
            : (events.find((e) => e.getStateKey() === stateKey) ?? null);
        },
      }),
    }),
    on: (event: string, listener: any) => roomEvents.on(event, listener),
    off: (event: string, listener: any) => roomEvents.off(event, listener),
  };
  const client: any = new EventEmitter();
  Object.assign(client, {
    getUserId: () => userId,
    getDeviceId: () => deviceId,
    sendStateEvent: vi.fn(
      (roomId: string, type: string, content: any, stateKey: string) => {
        const event = new MatrixEvent({
          type,
          room_id: roomId,
          sender: userId,
          state_key: stateKey,
          origin_server_ts: Date.now(),
          event_id: `$${state.size}`,
          content,
        });
        state.set(stateKey, event);
        setTimeout(() => client.emit(RoomStateEvent.Events, event), 0);
        return Promise.resolve({ event_id: event.getId() });
      },
    ),
    _unstable_sendDelayedStateEvent: vi.fn(() =>
      Promise.reject(
        new UnsupportedDelayedEventsEndpointError(
          'Server does not support the delayed events API',
          'sendDelayedStateEvent',
        ),
      ),
    ),
    encryptAndSendToDevice: vi.fn(),
  });
  return { client, room, state };
}

describe('joinCallSession', () => {
  it('publishes a membership Element Call reads, without delayed events', async () => {
    const { client, room } = fakeHomeserver();
    const focus = {
      type: 'livekit',
      livekit_service_url: 'https://lk.test',
      livekit_alias: ROOM_ID,
    };

    const handle = await joinCallSession(client, room, [focus]);
    await handle.joined;

    const [roomId, type, content, stateKey] =
      client.sendStateEvent.mock.calls[0];
    expect([roomId, type, stateKey]).toEqual([
      ROOM_ID,
      CALL_MEMBER_EVENT,
      '_@me:s_DEV1_m.call',
    ]);
    expect(content).toMatchObject({
      application: 'm.call',
      call_id: '',
      scope: 'm.room',
      device_id: 'DEV1',
      membershipID: '@me:s:DEV1',
      expires: 60 * 60 * 1000,
      focus_active: { type: 'livekit', focus_selection: 'oldest_membership' },
      foci_preferred: [focus],
    });
    // The session reads its own membership back once sync delivers it.
    await vi.waitFor(() =>
      expect(handle.session.memberships.map((m) => m.deviceId)).toEqual([
        'DEV1',
      ]),
    );

    await handle.leave(1000);
    expect(client.sendStateEvent).toHaveBeenLastCalledWith(
      ROOM_ID,
      CALL_MEMBER_EVENT,
      {},
      '_@me:s_DEV1_m.call',
    );
    expect(client.listenerCount(RoomStateEvent.Events)).toBe(0);
  });

  it('publishes its membership again when another member clears it', async () => {
    const { client, room, state } = fakeHomeserver();
    const handle = await joinCallSession(client, room, []);
    await handle.joined;
    await vi.waitFor(() => expect(handle.session.memberships).toHaveLength(1));

    const cleared = memberEvent('@mallory:s', 'x', {});
    (cleared.event as any).state_key = '_@me:s_DEV1_m.call';
    state.set('_@me:s_DEV1_m.call', cleared);
    client.emit(RoomStateEvent.Events, cleared);

    await vi.waitFor(() =>
      expect(client.sendStateEvent).toHaveBeenCalledTimes(2),
    );
    expect(client.sendStateEvent.mock.calls[1][2]).toMatchObject({
      device_id: 'DEV1',
    });
    await handle.leave(1000);
  });

  it('reports a membership the homeserver refuses', async () => {
    const { client, room } = fakeHomeserver();
    client.sendStateEvent.mockRejectedValue(
      new MatrixError({ errcode: 'M_FORBIDDEN' }, 403),
    );

    const handle = await joinCallSession(client, room, []);

    await expect(handle.joined).rejects.toBeTruthy();
    await expect(handle.lost).resolves.toBeTruthy();
    await handle.leave(10);
    // The key transport the session started is stopped as well.
    expect(client.listenerCount(ClientEvent.ToDeviceEvent)).toBe(0);
    expect(client.listenerCount(RoomStateEvent.Events)).toBe(0);
  });

  it('leaves from a closing page, even before the call connects', async () => {
    const { client, room } = fakeHomeserver();
    client.getHomeserverUrl = () => 'https://hs.test';
    client.getAccessToken = () => 'token';
    const fetchMock = vi.fn(() => Promise.resolve(new Response('{}')));
    vi.stubGlobal('fetch', fetchMock);
    try {
      const handle = await joinCallSession(client, room, []);

      window.dispatchEvent(new Event('pagehide'));
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0] as any[];
      expect(url).toBe(
        'https://hs.test/_matrix/client/v3/rooms/!r%3As/state/' +
          'org.matrix.msc3401.call.member/_%40me%3As_DEV1_m.call',
      );
      expect(init).toMatchObject({
        method: 'PUT',
        keepalive: true,
        body: '{}',
      });

      // Once left, a closing page sends nothing more.
      await handle.leave(1000);
      window.dispatchEvent(new Event('pagehide'));
      expect(fetchMock).toHaveBeenCalledTimes(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('gives up waiting for the membership when the call is left first', async () => {
    const { client, room } = fakeHomeserver();
    client.sendStateEvent.mockImplementation(
      () => new Promise(() => undefined),
    );

    const handle = await joinCallSession(client, room, []);
    void handle.leave(10);

    await expect(handle.joined).rejects.toThrow('Left the call');
  });
});

describe('sessionRoom', () => {
  const roomWith = (events: MatrixEvent[]) =>
    ({
      roomId: ROOM_ID,
      getLiveTimeline: () => ({
        getState: () => ({
          getStateEvents: (type: string, stateKey?: string) =>
            stateKey === undefined
              ? events.filter((e) => e.getType() === type)
              : events.find((e) => e.getStateKey() === stateKey),
        }),
      }),
    }) as any;

  it('shows the session only memberships that are valid now', () => {
    const valid = memberEvent('@a:s', 'A', membership('A'));
    const events = [
      valid,
      memberEvent('@b:s', 'B', membership('B', { expires: 'soon' })),
      memberEvent('@c:s', 'C', membership('C', { expires: NaN })),
      memberEvent('@d:s', 'D', membership('D', { expires: 1e15 })),
      memberEvent('@e:s', 'E', membership('E', { created_ts: NOW + 1e9 })),
      memberEvent('@f:s', 'F', {}),
    ];

    const state = sessionRoom(roomWith(events))
      .getLiveTimeline()
      .getState('f' as any)!;

    expect(state.getStateEvents(CALL_MEMBER_EVENT)).toEqual([valid]);
    // A lookup by state key, and other event types, are left alone.
    expect(
      state.getStateEvents(CALL_MEMBER_EVENT, events[1].getStateKey()!),
    ).toBe(events[1]);
  });
});
