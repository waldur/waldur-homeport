import { renderHook, waitFor } from '@testing-library/react';
import { useMediaQuery } from 'react-responsive';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { userGroupInvitationsCount } from 'waldur-js-client';

import * as AuthService from '@/auth/AuthService';
import { ENV } from '@/core/config';
import { isFeatureVisible } from '@/features/connect';
import { createTestWrapper } from '@/test/harness';
import { mockListResponse } from '@/test/utils';
import { useUser } from '@/workspace/hooks';

import { useFooterLinks } from './useFooterLinks';

vi.mock('@/auth/AuthService');
vi.mock('@/features/connect');
vi.mock('react-responsive');

describe('useFooterLinks', () => {
  beforeEach(() => {
    ENV.plugins.WALDUR_CORE.ANONYMOUS_USER_CAN_VIEW_OFFERINGS = true;
    vi.clearAllMocks();
    vi.mocked(userGroupInvitationsCount).mockResolvedValue(
      mockListResponse([], 0),
    );
  });

  it('returns desktop config when isMd is false', async () => {
    vi.mocked(useMediaQuery).mockReturnValue(false);
    vi.mocked(AuthService.isAuthenticated).mockReturnValue(true);
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    vi.mocked(isFeatureVisible).mockReturnValue(true);

    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useFooterLinks(), { wrapper });

    await waitFor(() => expect(result.current.config).toBeDefined());

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

  it('returns mobile (modal) config when isMd is true', async () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    vi.mocked(AuthService.isAuthenticated).mockReturnValue(false);
    vi.mocked(isFeatureVisible).mockReturnValue(true);
    vi.mocked(userGroupInvitationsCount).mockResolvedValue(
      mockListResponse([], 5),
    );

    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useFooterLinks(), { wrapper });

    await waitFor(() =>
      expect(
        result.current.config.dynamic.some((item) => item.id === 'join-org'),
      ).toBe(true),
    );

    expect(result.current.isMd).toBe(true);
    expect(
      result.current.config.dynamic.some((item) => item.id === 'calls'),
    ).toBe(true);
    expect(
      result.current.config.dynamic.some((item) => item.id === 'explore'),
    ).toBe(true);
    expect(
      result.current.config.dynamic.find((item) => item.id === 'join-org')
        .label,
    ).toBe('Join public organization');
  });

  it('shows Join Organization on desktop for authenticated user with permissions', async () => {
    vi.mocked(useMediaQuery).mockReturnValue(false);
    vi.mocked(AuthService.isAuthenticated).mockReturnValue(true);
    vi.mocked(useUser).mockReturnValue({ username: 'user' } as any);
    vi.mocked(isFeatureVisible).mockReturnValue(false); // hide_organization_information... = false
    vi.mocked(userGroupInvitationsCount).mockResolvedValue(
      mockListResponse([], 3),
    );

    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useFooterLinks(), { wrapper });

    await waitFor(() =>
      expect(
        result.current.config.dynamic.some((item) => item.id === 'join-org'),
      ).toBe(true),
    );

    expect(
      result.current.config.dynamic.find((item) => item.id === 'join-org')
        .label,
    ).toBe('Join organization');
  });
});
