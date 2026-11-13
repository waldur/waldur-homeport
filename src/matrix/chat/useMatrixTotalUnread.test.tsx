import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { matrixRoomsList } from 'waldur-js-client';

import { renderHookWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { useMatrixTotalUnread } from './useMatrixTotalUnread';

const { client, unread, emit } = vi.hoisted(() => {
  const unread: Record<string, number> = {};
  const listeners: Record<string, Set<(...args: any[]) => void>> = {};
  const room = (roomId: string) => ({
    roomId,
    getMyMembership: () => 'join',
    getUnreadNotificationCount: () => unread[roomId],
  });
  return {
    unread,
    emit: (name: string, ...args: any[]) =>
      listeners[name]?.forEach((listener) => listener(...args)),
    client: {
      getRooms: () => [
        room('!project:localhost'),
        room('!dm:localhost'),
        room('!other-project:localhost'),
      ],
      on: (name: string, listener: (...args: any[]) => void) => {
        (listeners[name] ??= new Set()).add(listener);
      },
      removeListener: (name: string, listener: (...args: any[]) => void) => {
        listeners[name]?.delete(listener);
      },
    },
  };
});

vi.mock('@/matrix/utils', () => ({ isMatrixChatEnabled: () => true }));
vi.mock('./useMatrixClient', () => ({
  useMatrixClient: () => ({ client, connectionState: 'connected' }),
}));

describe('useMatrixTotalUnread', () => {
  beforeEach(() => {
    Object.assign(unread, {
      '!project:localhost': 3,
      '!dm:localhost': 2,
      '!other-project:localhost': 1,
    });
    vi.mocked(useUser).mockReturnValue({ uuid: 'user-1' } as any);
    vi.mocked(matrixRoomsList).mockResolvedValue({
      data: [
        { uuid: 'a', room_id: '!project:localhost' },
        { uuid: 'b', room_id: '!other-project:localhost' },
      ],
    } as any);
  });

  afterEach(() => {
    vi.mocked(matrixRoomsList).mockReset();
  });

  // A DM or a room joined in an external client is in the Matrix account but
  // not in Waldur's room list, so the drawer cannot show where its unread is.
  it('counts only the rooms Waldur lists for the user', async () => {
    const { result } = renderHookWithProviders(() => useMatrixTotalUnread());

    await waitFor(() => expect(result.current).toBe(4));
  });

  it('leaves out the open room', async () => {
    const { result } = renderHookWithProviders(() =>
      useMatrixTotalUnread('!project:localhost'),
    );

    await waitFor(() => expect(matrixRoomsList).toHaveBeenCalled());
    await waitFor(() => expect(result.current).toBe(1));
  });

  // In an encrypted room the event reaches the timeline still encrypted; the
  // SDK raises the room's count only once it decrypts, and the room event it
  // emits for that is not re-emitted on the client.
  it('follows a count raised when a live event decrypts', async () => {
    const { result } = renderHookWithProviders(() => useMatrixTotalUnread());
    await waitFor(() => expect(result.current).toBe(4));

    act(() => {
      unread['!project:localhost'] = 4;
      emit('Event.decrypted', { getRoomId: () => '!project:localhost' });
    });

    await waitFor(() => expect(result.current).toBe(5));
  });
});
