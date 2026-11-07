import { describe, expect, it, vi } from 'vitest';

import { getServiceAccessMode } from '@/marketplace/serviceAccessMode';

import { DEFAULT_REDIRECT_STATE, getLandingState } from './landingState';

vi.mock('@/marketplace/serviceAccessMode', () => ({
  getServiceAccessMode: vi.fn(),
}));

describe('getLandingState', () => {
  it('starts on the calls in calls-only mode', () => {
    vi.mocked(getServiceAccessMode).mockReturnValue('calls');
    expect(getLandingState()).toBe('calls-for-proposals-dashboard');
  });

  it.each(['both', 'marketplace'] as const)(
    'starts on the profile in %s mode',
    (mode) => {
      vi.mocked(getServiceAccessMode).mockReturnValue(mode);
      expect(getLandingState()).toBe(DEFAULT_REDIRECT_STATE);
    },
  );
});
