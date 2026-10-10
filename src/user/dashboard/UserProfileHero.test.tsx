import { render, screen } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { User } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { router } from '@/router';

import { UserProfileHero } from './UserProfileHero';

vi.mock('./UserProfile', () => ({
  UserProfile: () => <div data-testid="user-profile" />,
}));

const staffUser = {
  uuid: 'user-1',
  is_staff: true,
  agreement_date: '2020-01-01T00:00:00Z',
} as User;

const setCurrentState = (name: string) => {
  vi.mocked(useCurrentStateAndParams).mockReturnValue({
    state: { name },
    params: {},
  } as any);
};

describe('UserProfileHero', () => {
  beforeEach(() => {
    (ENV.plugins.WALDUR_CORE as any).USER_MANDATORY_FIELDS = [];
    setCurrentState('profile.details');
  });

  afterEach(() => {
    vi.mocked(useCurrentStateAndParams).mockImplementation(
      () =>
        ({
          state: router.globals.$current,
          params: router.globals.params,
        }) as any,
    );
  });

  it('renders View and Edit as links, not a tablist', () => {
    render(<UserProfileHero user={staffUser} />);

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View' })).toHaveAttribute(
      'href',
      'profile.details',
    );
    expect(screen.getByRole('link', { name: 'Edit' })).toHaveAttribute(
      'href',
      'profile-manage',
    );
  });

  it('marks View as active on the details route', () => {
    render(<UserProfileHero user={staffUser} />);

    expect(screen.getByRole('link', { name: 'View' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Edit' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('marks Edit as active on the manage route', () => {
    setCurrentState('profile-manage');
    render(<UserProfileHero user={staffUser} />);

    expect(screen.getByRole('link', { name: 'Edit' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(
      screen.queryByRole('link', { name: 'View' }),
    ).not.toBeInTheDocument();
  });
});
