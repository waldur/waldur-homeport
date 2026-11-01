import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { FC, PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { matrixRoomsList } from 'waldur-js-client';

import { MAX_PAGE_SIZE } from '@/core/api';
import { OWN_ERROR_STATE } from '@/core/queryRetry';
import { useUser } from '@/workspace/hooks';

import { useMemberMatrixRooms } from './useMemberMatrixRooms';

vi.mock('@/matrix/utils', () => ({ isMatrixChatEnabled: () => true }));

let client: QueryClient;

const wrapper: FC<PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

const page = (uuids: string[], next: boolean) => ({
  data: uuids.map((uuid) => ({ uuid })),
  response: {
    headers: new Headers(
      next ? { link: '<https://example.com/?page=2>; rel="next"' } : {},
    ),
  },
});

describe('useMemberMatrixRooms', () => {
  beforeEach(() => {
    client = new QueryClient();
    vi.mocked(matrixRoomsList).mockReset();
    vi.mocked(useUser).mockReturnValue({ uuid: 'user-1' } as any);
  });

  it('reads every page of the rooms', async () => {
    vi.mocked(matrixRoomsList)
      .mockResolvedValueOnce(page(['room-1'], true) as any)
      .mockResolvedValueOnce(page(['room-2'], false) as any);

    const { result } = renderHook(() => useMemberMatrixRooms(), { wrapper });

    await waitFor(() =>
      expect(result.current.data?.map((room) => room.uuid)).toEqual([
        'room-1',
        'room-2',
      ]),
    );
    // Staff are limited to their own rooms only by `member`, on every page.
    for (const page of [1, 2]) {
      expect(matrixRoomsList).toHaveBeenCalledWith({
        query: { member: true, page, page_size: MAX_PAGE_SIZE },
      });
    }
  });

  it('makes one request when the rooms fit on a page', async () => {
    vi.mocked(matrixRoomsList).mockResolvedValueOnce(
      page(['room-1'], false) as any,
    );

    const { result } = renderHook(() => useMemberMatrixRooms(), { wrapper });

    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(matrixRoomsList).toHaveBeenCalledTimes(1);
  });

  it('leaves the page alone when the list fails', async () => {
    vi.mocked(matrixRoomsList).mockResolvedValueOnce(
      page(['room-1'], false) as any,
    );

    const { result } = renderHook(() => useMemberMatrixRooms(), { wrapper });

    await waitFor(() => expect(result.current.data).toHaveLength(1));
    const query = client.getQueryCache().find({ queryKey: ['matrixRoomsAll'] });
    expect(query?.meta).toEqual(OWN_ERROR_STATE);
  });
});
