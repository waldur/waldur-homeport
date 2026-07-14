import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { FC, PropsWithChildren } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { matrixRoomsList } from 'waldur-js-client';

import { useUser } from '@/workspace/hooks';

import { useAllMatrixRooms } from './useAllMatrixRooms';

// waldur-js-client is auto-mocked globally (test/mocks/modal.js); just give the
// shared list call a resolved value here.
vi.mock('@/matrix/utils', () => ({ isMatrixChatEnabled: () => true }));
vi.mock('./useMatrixClient', () => ({
  useMatrixClient: () => ({ client: null, connectionState: 'idle' }),
}));
vi.mock('./call/useAllRoomCallStates', () => ({
  useAllRoomCallStates: () => new Map(),
}));
vi.mock('./useRoomMemberNames', () => ({
  useAllRoomMemberNames: () => new Map(),
}));

const makeWrapper = (): FC<PropsWithChildren> => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAllMatrixRooms — authentication gate', () => {
  beforeEach(() => {
    vi.mocked(matrixRoomsList).mockResolvedValue({ data: [] } as any);
  });

  afterEach(() => {
    vi.mocked(matrixRoomsList).mockReset();
  });

  // The rooms poll shares its query key with useMatrixAutoConnect, which is
  // already gated on the current user. Leaving this observer ungated forces the
  // shared query to fire anonymously during the OIDC login transition; its 401
  // then lands after the exchanged token is stored and bounces the user out.
  it('does not fetch the rooms list while unauthenticated', async () => {
    vi.mocked(useUser).mockReturnValue(null as any);

    renderHook(() => useAllMatrixRooms(), { wrapper: makeWrapper() });
    // Flush the mount effects so any query the hook scheduled would have fired.
    await Promise.resolve();

    expect(matrixRoomsList).not.toHaveBeenCalled();
  });

  it('fetches the rooms list once a user is present', async () => {
    vi.mocked(useUser).mockReturnValue({ uuid: 'user-1' } as any);

    renderHook(() => useAllMatrixRooms(), { wrapper: makeWrapper() });

    await waitFor(() => expect(matrixRoomsList).toHaveBeenCalled());
  });
});
