import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isFeatureVisible } from '@/features/connect';
import { useUser } from '@/workspace/hooks';

import { usePublicCallApply } from './usePublicCallApply';

vi.mock('@/features/connect', () => ({
  isFeatureVisible: vi.fn(),
}));

const round = (uuid: string, status: string) => ({
  uuid,
  status,
  start_time: '2026-01-01',
  cutoff_time: '2026-12-01',
});

const call = (...rounds) =>
  ({ uuid: 'call-1', state: 'active', rounds }) as any;

const activeRoundOf = (...rounds) =>
  renderHook(() => usePublicCallApply(call(...rounds))).result.current
    .activeRound;

describe('usePublicCallApply', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({ uuid: 'user-1' } as any);
    vi.mocked(isFeatureVisible).mockReturnValue(false);
  });

  it('applies through an open round', () => {
    expect(activeRoundOf(round('r-open', 'open'))?.uuid).toBe('r-open');
  });

  // Rounds come back unsorted, and this used to read rounds[0] only.
  it('finds an open round that is not first in the list', () => {
    expect(
      activeRoundOf(round('r-ended', 'ended'), round('r-open', 'open'))?.uuid,
    ).toBe('r-open');
  });

  // The backend refuses a proposal until its round opens.
  it('does not offer a round that has not started', () => {
    expect(activeRoundOf(round('r-next', 'scheduled'))).toBeNull();
  });

  it('does not offer a round that has closed', () => {
    expect(activeRoundOf(round('r-past', 'ended'))).toBeNull();
  });

  it('does not offer anything on a call that is not active', () => {
    const draft = { ...call(round('r-open', 'open')), state: 'draft' };
    const { result } = renderHook(() => usePublicCallApply(draft as any));
    expect(result.current.activeRound).toBeNull();
  });

  describe('with an explicitly chosen round', () => {
    it('takes it when open', () => {
      const chosen = round('r-open', 'open');
      const { result } = renderHook(() =>
        usePublicCallApply(call(chosen), chosen as any),
      );
      expect(result.current.activeRound).toBe(chosen);
    });

    it('refuses it when not open', () => {
      const chosen = round('r-next', 'scheduled');
      const { result } = renderHook(() =>
        usePublicCallApply(call(chosen), chosen as any),
      );
      expect(result.current.activeRound).toBeNull();
    });
  });
});
