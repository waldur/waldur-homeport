import { waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { matrixRoomsList } from 'waldur-js-client';

import { renderHookWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { useMatrixTotalUnread } from './useMatrixTotalUnread';

const { client } = vi.hoisted(() => {
  const room = (roomId: string, unread: number) => ({
    roomId,
    getMyMembership: () => 'join',
    getUnreadNotificationCount: () => unread,
  });
  return {
    client: {
      getRooms: () => [
        room('!project:localhost', 3),
        room('!dm:localhost', 2),
        room('!other-project:localhost', 1),
      ],
      on: () => undefined,
      removeListener: () => undefined,
    },
  };
});

vi.mock('@/matrix/utils', () => ({ isMatrixChatEnabled: () => true }));
vi.mock('./useMatrixClient', () => ({
  useMatrixClient: () => ({ client, connectionState: 'connected' }),
}));

describe('useMatrixTotalUnread', () => {
  beforeEach(() => {
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
});
