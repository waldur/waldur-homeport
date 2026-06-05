import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAllRoomCallStates } from './useAllRoomCallStates';

const useMatrixClientMock = vi.fn();
vi.mock('../useMatrixClient', () => ({
  useMatrixClient: () => useMatrixClientMock(),
}));

const DEVICE_ID_KEY = 'waldur_matrix_device_id';

function buildClient(roomsByRoomId: Record<string, any>) {
  const listeners: Array<() => void> = [];
  return {
    listeners,
    getUserId: () => '@me:localhost',
    getRoom: (id: string) => roomsByRoomId[id] ?? null,
    on: (_: any, fn: () => void) => listeners.push(fn),
    removeListener: (_: any, fn: () => void) => {
      const idx = listeners.indexOf(fn);
      if (idx >= 0) listeners.splice(idx, 1);
    },
  };
}

function buildRoom(events: any[]) {
  return {
    currentState: {
      getStateEvents: () => events,
    },
  };
}

function event(senderId: string, memberships: any[]) {
  return {
    getContent: () => ({ memberships }),
    getSender: () => senderId,
  };
}

describe('useAllRoomCallStates', () => {
  beforeEach(() => {
    sessionStorage.setItem(DEVICE_ID_KEY, 'my-device');
    useMatrixClientMock.mockReset();
  });

  it('returns empty map when client is null', () => {
    useMatrixClientMock.mockReturnValue({ client: null });
    const { result } = renderHook(() => useAllRoomCallStates(['r1']));
    expect(result.current.size).toBe(0);
  });

  it('omits rooms with no callers', () => {
    const client = buildClient({ '!r1:localhost': buildRoom([]) });
    useMatrixClientMock.mockReturnValue({ client });
    const { result } = renderHook(() =>
      useAllRoomCallStates(['!r1:localhost']),
    );
    expect(result.current.size).toBe(0);
  });

  it('excludes the current user own active device from the count', () => {
    const now = Date.now();
    const client = buildClient({
      '!r1:localhost': buildRoom([
        event('@me:localhost', [
          { device_id: 'my-device', created_ts: now, expires: 60_000 },
        ]),
      ]),
    });
    useMatrixClientMock.mockReturnValue({ client });
    const { result } = renderHook(() =>
      useAllRoomCallStates(['!r1:localhost']),
    );
    expect(result.current.size).toBe(0);
  });

  it('counts a second device of the same user as another participant', () => {
    const now = Date.now();
    const client = buildClient({
      '!r1:localhost': buildRoom([
        event('@me:localhost', [
          { device_id: 'other-device', created_ts: now, expires: 60_000 },
        ]),
      ]),
    });
    useMatrixClientMock.mockReturnValue({ client });
    const { result } = renderHook(() =>
      useAllRoomCallStates(['!r1:localhost']),
    );
    expect(result.current.get('!r1:localhost')).toEqual({
      participantCount: 1,
    });
  });

  it('counts the current user when they are in the call alongside others', () => {
    const now = Date.now();
    const client = buildClient({
      '!r1:localhost': buildRoom([
        event('@me:localhost', [
          { device_id: 'my-device', created_ts: now, expires: 60_000 },
        ]),
        event('@bob:localhost', [
          { device_id: 'bob-dev', created_ts: now, expires: 60_000 },
        ]),
      ]),
    });
    useMatrixClientMock.mockReturnValue({ client });
    const { result } = renderHook(() =>
      useAllRoomCallStates(['!r1:localhost']),
    );
    expect(result.current.get('!r1:localhost')).toEqual({
      participantCount: 2,
    });
  });

  it('counts each user once even with multiple devices', () => {
    const now = Date.now();
    const client = buildClient({
      '!r1:localhost': buildRoom([
        event('@bob:localhost', [
          { device_id: 'bob-laptop', created_ts: now, expires: 60_000 },
          { device_id: 'bob-phone', created_ts: now, expires: 60_000 },
        ]),
      ]),
    });
    useMatrixClientMock.mockReturnValue({ client });
    const { result } = renderHook(() =>
      useAllRoomCallStates(['!r1:localhost']),
    );
    expect(result.current.get('!r1:localhost')).toEqual({
      participantCount: 1,
    });
  });

  it('clears expired memberships via a scheduled re-evaluation', () => {
    vi.useFakeTimers();
    try {
      const now = Date.now();
      const events = [
        event('@bob:localhost', [
          { device_id: 'bob-dev', created_ts: now, expires: 60_000 },
        ]),
      ];
      const room = {
        currentState: { getStateEvents: () => events },
      };
      const client = buildClient({ '!r1:localhost': room });
      useMatrixClientMock.mockReturnValue({ client });

      const { result } = renderHook(() =>
        useAllRoomCallStates(['!r1:localhost']),
      );
      expect(result.current.get('!r1:localhost')).toEqual({
        participantCount: 1,
      });

      act(() => {
        vi.advanceTimersByTime(61_000);
      });

      expect(result.current.size).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('refreshes when a RoomStateEvent fires', () => {
    const now = Date.now();
    let events: any[] = [];
    const room = {
      currentState: { getStateEvents: () => events },
    };
    const client = buildClient({ '!r1:localhost': room });
    useMatrixClientMock.mockReturnValue({ client });

    const { result } = renderHook(() =>
      useAllRoomCallStates(['!r1:localhost']),
    );
    expect(result.current.size).toBe(0);

    events = [
      event('@bob:localhost', [
        { device_id: 'bob-dev', created_ts: now, expires: 60_000 },
      ]),
    ];

    act(() => {
      client.listeners.forEach((fn) => fn());
    });

    expect(result.current.get('!r1:localhost')).toEqual({
      participantCount: 1,
    });
  });
});
