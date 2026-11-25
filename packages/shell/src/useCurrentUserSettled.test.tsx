import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usersMeRetrieve } from 'waldur-js-client';

import {
  CurrentUserProvider,
  toCurrentUser,
  useCurrentUser,
  useCurrentUserSettled,
} from './useCurrentUser';

const Probe = () => {
  const user = useCurrentUser();
  const settled = useCurrentUserSettled();
  return (
    <span data-testid="probe">
      {settled ? 'settled' : 'loading'}:{user?.uuid ?? 'none'}
    </span>
  );
};

const renderProbe = () =>
  render(
    <CurrentUserProvider>
      <Probe />
    </CurrentUserProvider>,
  );

describe('useCurrentUserSettled', () => {
  it('tells loading from an answer', async () => {
    let answer: (value: any) => void = () => {};
    vi.mocked(usersMeRetrieve).mockReturnValue(
      new Promise((resolve) => {
        answer = resolve;
      }) as any,
    );
    renderProbe();
    expect(screen.getByTestId('probe')).toHaveTextContent('loading:none');
    answer({ data: { uuid: 'u1', permissions: [] } });
    await waitFor(() =>
      expect(screen.getByTestId('probe')).toHaveTextContent('settled:u1'),
    );
  });

  it('settles after a failure too, with no user', async () => {
    vi.mocked(usersMeRetrieve).mockRejectedValue(new Error('offline'));
    renderProbe();
    await waitFor(() =>
      expect(screen.getByTestId('probe')).toHaveTextContent('settled:none'),
    );
  });
});

describe('toCurrentUser', () => {
  it('carries the user’s own flags and micro-app settings', () => {
    const user = toCurrentUser({
      uuid: 'u1',
      permissions: [],
      features: { user: { ssh_keys: true } },
      micro_apps: { 'ai-inference': false },
    } as any);
    expect(user.features).toEqual({ user: { ssh_keys: true } });
    expect(user.microApps).toEqual({ 'ai-inference': false });
  });
});
