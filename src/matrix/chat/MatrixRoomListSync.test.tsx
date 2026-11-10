import { EventEmitter } from 'events';

import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import {
  MatrixRoomListSync,
  ROOM_LIST_RETRY_DELAYS_MS,
} from './MatrixRoomListSync';

const h = vi.hoisted(() => ({
  client: null as any,
  connectionState: 'connected',
  rooms: [] as Array<{ room_id: string; state: string }>,
}));

vi.mock('./useMatrixClient', () => ({
  useMatrixClient: () => ({
    client: h.client,
    connectionState: h.connectionState,
  }),
}));

vi.mock('./useMemberMatrixRooms', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./useMemberMatrixRooms')>()),
  useMemberMatrixRooms: () => ({ data: h.rooms }),
}));

const ROOM_LIST = { queryKey: ['matrixRoomsAll'] };

const setup = () => {
  const result = renderWithProviders(<MatrixRoomListSync />);
  const invalidateQueries = vi.spyOn(result.queryClient, 'invalidateQueries');
  return { ...result, invalidateQueries };
};

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe('MatrixRoomListSync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    h.client = new EventEmitter();
    h.connectionState = 'connected';
    h.rooms = [{ room_id: '!listed:x', state: 'active' }];
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('refetches the room list when I join an unknown room', () => {
    const { invalidateQueries } = setup();

    h.client.emit('Room.myMembership', { roomId: '!new:x' }, 'join');

    expect(invalidateQueries).toHaveBeenCalledWith(ROOM_LIST);
  });

  it('retries until the room is listed, then stops', () => {
    const { invalidateQueries, rerender } = setup();

    h.client.emit('Room.myMembership', { roomId: '!new:x' }, 'join');
    advance(ROOM_LIST_RETRY_DELAYS_MS[1]);
    expect(invalidateQueries).toHaveBeenCalledTimes(2);

    h.rooms = [...h.rooms, { room_id: '!new:x', state: 'active' }];
    rerender(<MatrixRoomListSync />);
    advance(60_000);

    expect(invalidateQueries).toHaveBeenCalledTimes(2);
  });

  it('stops after the last retry', () => {
    const { invalidateQueries } = setup();

    h.client.emit('Room.myMembership', { roomId: '!new:x' }, 'join');
    ROOM_LIST_RETRY_DELAYS_MS.slice(1).forEach((delay, i) => {
      expect(invalidateQueries).toHaveBeenCalledTimes(i + 1);
      advance(delay);
    });
    advance(60_000);

    expect(invalidateQueries).toHaveBeenCalledTimes(4);
  });

  it('ignores rooms already in the list', () => {
    const { invalidateQueries } = setup();

    h.client.emit('Room.myMembership', { roomId: '!listed:x' }, 'join');
    advance(60_000);

    expect(invalidateQueries).not.toHaveBeenCalled();
  });

  // Reactivating an archived room force-joins its members again, while the
  // cached list still shows it archived and so hidden.
  it('refetches when I rejoin a room the list still shows as archived', () => {
    h.rooms = [{ room_id: '!archived:x', state: 'archived' }];
    const { invalidateQueries, rerender } = setup();

    h.client.emit('Room.myMembership', { roomId: '!archived:x' }, 'join');
    expect(invalidateQueries).toHaveBeenCalledWith(ROOM_LIST);
    advance(ROOM_LIST_RETRY_DELAYS_MS[1]);
    expect(invalidateQueries).toHaveBeenCalledTimes(2);

    h.rooms = [{ room_id: '!archived:x', state: 'active' }];
    rerender(<MatrixRoomListSync />);
    advance(60_000);

    expect(invalidateQueries).toHaveBeenCalledTimes(2);
  });

  // A customer role grant joins every project room of the customer at once.
  it('coalesces a burst of joins into one retry schedule', () => {
    const { invalidateQueries } = setup();

    ['!a:x', '!b:x', '!c:x'].forEach((roomId) =>
      h.client.emit('Room.myMembership', { roomId }, 'join'),
    );
    advance(60_000);

    expect(invalidateQueries).toHaveBeenCalledTimes(4);
  });

  it('does not hold back retries while rooms keep arriving', () => {
    const { invalidateQueries } = setup();
    const gap = (ROOM_LIST_RETRY_DELAYS_MS[1] * 3) / 4;

    h.client.emit('Room.myMembership', { roomId: '!a:x' }, 'join');
    advance(gap);
    h.client.emit('Room.myMembership', { roomId: '!b:x' }, 'join');
    advance(gap);

    expect(invalidateQueries).toHaveBeenCalledTimes(2);
  });

  it('gives a room that arrives late its first retry', () => {
    const { invalidateQueries } = setup();

    h.client.emit('Room.myMembership', { roomId: '!a:x' }, 'join');
    advance(ROOM_LIST_RETRY_DELAYS_MS[1]);
    h.client.emit('Room.myMembership', { roomId: '!b:x' }, 'join');
    advance(ROOM_LIST_RETRY_DELAYS_MS[1]);

    expect(invalidateQueries).toHaveBeenCalledTimes(3);
  });

  it('ignores a repeated join of a room it is already waiting for', () => {
    const { invalidateQueries } = setup();

    h.client.emit('Room.myMembership', { roomId: '!new:x' }, 'join');
    advance(ROOM_LIST_RETRY_DELAYS_MS[1]);
    h.client.emit('Room.myMembership', { roomId: '!new:x' }, 'join');
    advance(ROOM_LIST_RETRY_DELAYS_MS[1]);
    expect(invalidateQueries).toHaveBeenCalledTimes(2);
    advance(ROOM_LIST_RETRY_DELAYS_MS[2] - ROOM_LIST_RETRY_DELAYS_MS[1]);

    expect(invalidateQueries).toHaveBeenCalledTimes(3);
  });

  it('stops waiting for a room I leave before it is listed', () => {
    const { invalidateQueries } = setup();

    h.client.emit('Room.myMembership', { roomId: '!new:x' }, 'join');
    h.client.emit('Room.myMembership', { roomId: '!new:x' }, 'leave');
    advance(60_000);

    expect(invalidateQueries).toHaveBeenCalledTimes(1);
  });

  it('forgets a room once its retries run out', () => {
    const { invalidateQueries, rerender } = setup();

    h.client.emit('Room.myMembership', { roomId: '!never:x' }, 'join');
    advance(60_000);
    h.client.emit('Room.myMembership', { roomId: '!new:x' }, 'join');
    h.rooms = [...h.rooms, { room_id: '!new:x', state: 'active' }];
    rerender(<MatrixRoomListSync />);
    advance(60_000);

    expect(invalidateQueries).toHaveBeenCalledTimes(5);
  });

  it('refetches when I leave a listed room', () => {
    const { invalidateQueries } = setup();

    h.client.emit('Room.myMembership', { roomId: '!listed:x' }, 'leave');

    expect(invalidateQueries).toHaveBeenCalledTimes(1);
    expect(invalidateQueries).toHaveBeenCalledWith(ROOM_LIST);
  });

  // Waldur records the member as gone only after the Matrix kick, so the
  // first fetch can still list the room.
  it('retries a leave until the room is gone, then stops', () => {
    const { invalidateQueries, rerender } = setup();

    h.client.emit('Room.myMembership', { roomId: '!listed:x' }, 'leave');
    advance(ROOM_LIST_RETRY_DELAYS_MS[1]);
    expect(invalidateQueries).toHaveBeenCalledTimes(2);

    h.rooms = [];
    rerender(<MatrixRoomListSync />);
    advance(60_000);

    expect(invalidateQueries).toHaveBeenCalledTimes(2);
  });

  it('ignores leaving a room the list does not have', () => {
    const { invalidateQueries } = setup();

    h.client.emit('Room.myMembership', { roomId: '!dm:x' }, 'leave');

    expect(invalidateQueries).not.toHaveBeenCalled();
  });

  // The first sync replays a join for every room the account is in, DMs and
  // rooms joined elsewhere included; none of them is news.
  it('ignores memberships until the client has synced', () => {
    h.connectionState = 'connecting';
    const { invalidateQueries } = setup();

    h.client.emit('Room.myMembership', { roomId: '!dm:x' }, 'join');
    advance(60_000);

    expect(invalidateQueries).not.toHaveBeenCalled();
  });

  it('cancels pending retries on unmount', () => {
    const { invalidateQueries, unmount } = setup();

    h.client.emit('Room.myMembership', { roomId: '!new:x' }, 'join');
    unmount();
    advance(60_000);
    h.client.emit('Room.myMembership', { roomId: '!other:x' }, 'join');

    expect(invalidateQueries).toHaveBeenCalledTimes(1);
  });
});
