import { render, screen } from '@testing-library/react';
import { useRouter } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RedirectStorage } from '@/core/StorageManager';

import { AuthHeader } from './AuthHeader';

vi.mock('@/core/StorageManager', () => ({
  RedirectStorage: { get: vi.fn() },
}));

const SESSION_EXPIRED = /Your session has expired/;

const setRouterParams = (params: object) =>
  vi.mocked(useRouter).mockReturnValue({ globals: { params } } as any);

describe('AuthHeader', () => {
  beforeEach(() => {
    vi.mocked(RedirectStorage.get).mockReturnValue(null);
    setRouterParams({});
  });

  it('says nothing on a plain visit to the login page', () => {
    render(<AuthHeader />);
    expect(screen.queryByText(SESSION_EXPIRED)).not.toBeInTheDocument();
  });

  it('explains the expiry when the guard passed the destination as a param', () => {
    setRouterParams({ toState: 'profile.details' });
    render(<AuthHeader />);
    expect(screen.getByText(SESSION_EXPIRED)).toBeInTheDocument();
  });

  it('explains the expiry when a mid-transition 401 stored the destination', () => {
    vi.mocked(RedirectStorage.get).mockReturnValue({
      toState: 'profile.details',
      toParams: {},
    });
    render(<AuthHeader />);
    expect(screen.getByText(SESSION_EXPIRED)).toBeInTheDocument();
  });

  it('stays quiet when the stored redirect carries no destination', () => {
    vi.mocked(RedirectStorage.get).mockReturnValue({
      toState: undefined,
      toParams: {},
    } as any);
    render(<AuthHeader />);
    expect(screen.queryByText(SESSION_EXPIRED)).not.toBeInTheDocument();
  });
});
