import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useRoomBotUserId } from './useRoomBotUserId';

const h = vi.hoisted(() => ({
  activeRoomUuid: 'room-1' as string | null,
  rooms: undefined as any[] | undefined,
}));

vi.mock('./useMatrixClient', () => ({
  useMatrixClient: () => ({ activeRoomUuid: h.activeRoomUuid }),
}));
vi.mock('./useMemberMatrixRooms', () => ({
  useMemberMatrixRooms: () => ({ data: h.rooms }),
}));

describe('useRoomBotUserId', () => {
  it('is the bot Waldur reports for the active room', () => {
    h.rooms = [
      { uuid: 'room-0', bot_user_id: '@other-bot:s' },
      { uuid: 'room-1', bot_user_id: '@waldur-bot:s' },
    ];
    const { result } = renderHook(() => useRoomBotUserId());
    expect(result.current).toBe('@waldur-bot:s');
  });

  it('is unknown until the rooms are loaded', () => {
    h.rooms = undefined;
    const { result } = renderHook(() => useRoomBotUserId());
    expect(result.current).toBeNull();
  });
});
