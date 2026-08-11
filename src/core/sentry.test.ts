import { describe, expect, it, vi, beforeEach } from 'vitest';

import { SET_CURRENT_USER } from '@/workspace/constants';

import { sentryUserMiddleware } from './sentry';

const setSentryUser = vi.fn();

vi.mock('waldur-telemetry', () => ({
  initSentry: vi.fn(),
  setSentryUser: (...args: unknown[]) => setSentryUser(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('sentryUserMiddleware', () => {
  const run = (action: any) => {
    const next = vi.fn((a) => a);
    sentryUserMiddleware({} as any)(next)(action);
    return next;
  };

  it('sets the Sentry user by uuid only (no username/email PII) on login', () => {
    run({
      type: SET_CURRENT_USER,
      payload: { user: { uuid: 'u1', username: 'alice', email: 'a@x.io' } },
    });
    expect(setSentryUser).toHaveBeenCalledWith('u1');
  });

  it('clears the Sentry user on logout', () => {
    run({ type: SET_CURRENT_USER, payload: { user: undefined } });
    expect(setSentryUser).toHaveBeenCalledWith(null);
  });

  it('ignores unrelated actions and forwards them', () => {
    const next = run({ type: 'waldur/other' });
    expect(setSentryUser).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith({ type: 'waldur/other' });
  });
});
