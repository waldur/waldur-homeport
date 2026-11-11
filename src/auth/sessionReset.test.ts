import { beforeEach, describe, expect, it, vi } from 'vitest';

const { dispatchMock, resetUserCacheMock } = vi.hoisted(() => ({
  dispatchMock: vi.fn(),
  resetUserCacheMock: vi.fn(),
}));

vi.mock('@/store/store', () => ({
  default: { dispatch: dispatchMock, getState: vi.fn() },
}));

vi.mock('@/user/UsersService', () => ({
  resetUserCache: resetUserCacheMock,
}));

import { ENV } from '@/core/config';
import { BOOTSTRAP_QUERY_KEY, queryClient } from '@/core/queryClient';
import { RESET_SESSION } from '@/store/reducers';

import { ReauthenticationCancelled } from './reauthentication/api';
import { requestReauthentication } from './reauthentication/prompt';
import { resetSessionState } from './sessionReset';

describe('resetSessionState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    queryClient.setQueryData(BOOTSTRAP_QUERY_KEY, true);
    queryClient.setQueryData(['projects', 'u1'], ['a']);
    ENV.roles = [{ uuid: 'r1' } as any];
  });

  it('forgets the session but keeps the bootstrap query', () => {
    resetSessionState();

    expect(queryClient.getQueryData(BOOTSTRAP_QUERY_KEY)).toBe(true);
    expect(queryClient.getQueryData(['projects', 'u1'])).toBeUndefined();
    expect(ENV.roles).toEqual([]);
    expect(resetUserCacheMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledWith({ type: RESET_SESSION });
  });

  it('fails a change still waiting for the user to confirm it is them', async () => {
    const waiting = requestReauthentication({
      action: 'change_email',
      methods: ['password'],
    }).catch((reason) => reason);

    resetSessionState({ queries: false });

    const reason = await waiting;
    expect(reason).toBeInstanceOf(ReauthenticationCancelled);
    expect(reason.message).toBe(
      'Nothing was changed, because the session ended.',
    );
  });

  it('can leave the query cache alone', () => {
    resetSessionState({ queries: false });

    expect(queryClient.getQueryData(['projects', 'u1'])).toEqual(['a']);
    expect(ENV.roles).toEqual([]);
    expect(dispatchMock).toHaveBeenCalledWith({ type: RESET_SESSION });
  });
});
