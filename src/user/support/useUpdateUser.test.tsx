import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usersPartialUpdate } from 'waldur-js-client';

import { useUpdateUser } from './useUpdateUser';

vi.mock('@/invitations/join-organization/submission', () => ({
  useRequestToAccessOrganization: () => ({ request: vi.fn() }),
}));

describe('useUpdateUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Guards the regression where staff editing another user's profile did not
  // refresh the detail view until a page reload: the ['User', uuid] query that
  // feeds the EditFieldProvider scope must be invalidated after a successful
  // update.
  it('invalidates the User query after a successful update', async () => {
    vi.mocked(usersPartialUpdate).mockResolvedValue({
      data: { uuid: 'user-9' },
    } as any);

    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () => useUpdateUser({ uuid: 'user-9' } as any),
      { wrapper },
    );

    await act(async () => {
      await result.current.callback({ first_name: 'Jane' });
    });

    expect(usersPartialUpdate).toHaveBeenCalled();
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['User', 'user-9'],
    });
  });
});
