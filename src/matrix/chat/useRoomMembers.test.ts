import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useRoomMembers } from './useRoomMembers';

const h = vi.hoisted(() => ({
  client: null as any,
  activeRoomId: null as string | null,
}));

vi.mock('./useMatrixClient', () => ({
  useMatrixClient: () => ({
    client: h.client,
    activeRoomId: h.activeRoomId,
    activeRoomUuid: h.activeRoomId ? 'room-uuid' : null,
  }),
}));

vi.mock('./useRoomMemberNames', () => ({
  useRoomMemberNames: () => new Map(),
  useRoomMemberImages: () => new Map(),
}));

const fakeRoom = {
  getJoinedMembers: () => [
    { userId: '@mart:s', name: 'Mart Tamm', membership: 'join' },
    { userId: '@bot:s', name: 'AI Assistant', membership: 'join' },
  ],
  getMembersWithMembership: (membership: string) =>
    membership === 'invite'
      ? [{ userId: '@lea:s', name: 'Lea Eichenbaum', membership: 'invite' }]
      : [],
  currentState: {
    getStateEvents: (type: string) =>
      type === 'm.room.power_levels'
        ? { getContent: () => ({ users: { '@bot:s': 100 } }) }
        : null,
  },
};

beforeEach(() => {
  h.client = { getRoom: () => fakeRoom };
  h.activeRoomId = '!room:s';
});

describe('useRoomMembers', () => {
  it('returns an empty list when the client is not connected', () => {
    h.client = null;
    h.activeRoomId = null;
    const { result } = renderHook(() => useRoomMembers());
    expect(result.current).toEqual([]);
  });

  it('lists joined members before invited members', () => {
    const { result } = renderHook(() => useRoomMembers());
    expect(result.current.map((m) => m.userId)).toEqual([
      '@bot:s',
      '@mart:s',
      '@lea:s',
    ]);
  });

  it('reads each member power level from the room state', () => {
    const { result } = renderHook(() => useRoomMembers());
    const bot = result.current.find((m) => m.userId === '@bot:s');
    expect(bot?.powerLevel).toBe(100);
  });
});
