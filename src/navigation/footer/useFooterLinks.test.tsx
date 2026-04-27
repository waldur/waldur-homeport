import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import * as AuthService from '@/auth/AuthService';
import { isFeatureVisible } from '@/features/connect';
import { useUser } from '@/workspace/hooks';

import { useFooterLinks } from './useFooterLinks';

vi.mock('@/auth/AuthService');
vi.mock('@/workspace/hooks');
vi.mock('@/features/connect');
vi.mock('react-redux');
vi.mock('react-responsive');
vi.mock('@tanstack/react-query');
vi.mock('@/core/config', () => ({
  ENV: {
    plugins: {
      WALDUR_CORE: {
        ANONYMOUS_USER_CAN_VIEW_OFFERINGS: true,
      },
    },
  },
}));

describe('useFooterLinks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useQuery).mockReturnValue({ data: 0 } as any);
    vi.mocked(useSelector).mockReturnValue(false);
  });

  it('returns desktop config when isMd is false', () => {
    vi.mocked(useMediaQuery).mockReturnValue(false);
    vi.mocked(AuthService.isAuthenticated).mockReturnValue(true);
    vi.mocked(useUser).mockReturnValue({ is_staff: true });
    vi.mocked(isFeatureVisible).mockReturnValue(true);

    const { result } = renderHook(() => useFooterLinks());

    expect(result.current.isMd).toBe(false);
    // On desktop, dynamic links (calls, explore) are hidden for authenticated users in the current logic
    // if (!isAuth || isMd)
    expect(
      result.current.config.dynamic.some((item) => item.id === 'calls'),
    ).toBe(false);
    expect(
      result.current.config.dynamic.some((item) => item.id === 'explore'),
    ).toBe(false);
  });

  it('returns mobile (modal) config when isMd is true', () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    vi.mocked(AuthService.isAuthenticated).mockReturnValue(false);
    vi.mocked(isFeatureVisible).mockReturnValue(true);
    vi.mocked(useQuery).mockReturnValue({ data: 5 } as any);

    const { result } = renderHook(() => useFooterLinks());

    expect(result.current.isMd).toBe(true);
    expect(
      result.current.config.dynamic.some((item) => item.id === 'calls'),
    ).toBe(true);
    expect(
      result.current.config.dynamic.some((item) => item.id === 'explore'),
    ).toBe(true);
    expect(
      result.current.config.dynamic.some((item) => item.id === 'join-org'),
    ).toBe(true);
    expect(
      result.current.config.dynamic.find((item) => item.id === 'join-org')
        .label,
    ).toBe('Join public organization');
  });

  it('shows Join Organization on desktop for authenticated user with permissions', () => {
    vi.mocked(useMediaQuery).mockReturnValue(false);
    vi.mocked(AuthService.isAuthenticated).mockReturnValue(true);
    vi.mocked(useUser).mockReturnValue({ username: 'user' });
    vi.mocked(isFeatureVisible).mockReturnValue(false); // hide_organization_information... = false
    vi.mocked(useSelector).mockReturnValue(true); // hasNonProjectPerms = true
    vi.mocked(useQuery).mockReturnValue({ data: 3 } as any); // public invites exist

    const { result } = renderHook(() => useFooterLinks());

    expect(
      result.current.config.dynamic.some((item) => item.id === 'join-org'),
    ).toBe(true);
    expect(
      result.current.config.dynamic.find((item) => item.id === 'join-org')
        .label,
    ).toBe('Join organization');
  });
});
