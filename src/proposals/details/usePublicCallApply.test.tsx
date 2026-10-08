import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalPublicCallsCheckEligibilityRetrieve } from 'waldur-js-client';

import { isFeatureVisible } from '@/features/connect';
import { renderHookWithProviders as renderHook } from '@/test/harness';
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

  describe('applicant eligibility', () => {
    const restricted = (...rounds) => ({
      ...call(...rounds),
      has_eligibility_restrictions: true,
    });
    const eligibility = (is_eligible: boolean) =>
      vi
        .mocked(proposalPublicCallsCheckEligibilityRetrieve)
        .mockResolvedValue({ data: { is_eligible, restrictions: [] } } as any);

    it('refuses an ineligible applicant and says why', async () => {
      eligibility(false);
      const { result } = renderHook(() =>
        usePublicCallApply(restricted(round('r-open', 'open'))),
      );
      await waitFor(() => expect(result.current.ineligible).toBe(true));
      expect(result.current.disabledReason).toBe(
        'You are not eligible to apply to this call.',
      );
    });

    it('lets an eligible applicant apply', async () => {
      eligibility(true);
      const { result } = renderHook(() =>
        usePublicCallApply(restricted(round('r-open', 'open'))),
      );
      await waitFor(() =>
        expect(result.current.disabledReason).toBeUndefined(),
      );
      expect(result.current.ineligible).toBe(false);
    });

    it('waits for the answer before offering Apply', () => {
      vi.mocked(proposalPublicCallsCheckEligibilityRetrieve).mockReturnValue(
        new Promise(() => undefined) as any,
      );
      const { result } = renderHook(() =>
        usePublicCallApply(restricted(round('r-open', 'open'))),
      );
      expect(result.current.disabledReason).toBe('Checking eligibility…');
    });

    // Proposal creation re-validates the user, so the backend stays the
    // authority when the check itself cannot answer.
    it('leaves Apply enabled when the check fails', async () => {
      vi.mocked(proposalPublicCallsCheckEligibilityRetrieve).mockRejectedValue(
        new Error('boom'),
      );
      const { result } = renderHook(() =>
        usePublicCallApply(restricted(round('r-open', 'open'))),
      );
      await waitFor(() =>
        expect(result.current.disabledReason).toBeUndefined(),
      );
      expect(result.current.ineligible).toBe(false);
    });

    it('names the missing round before eligibility', async () => {
      eligibility(false);
      const { result } = renderHook(() =>
        usePublicCallApply(restricted(round('r-past', 'ended'))),
      );
      await waitFor(() => expect(result.current.ineligible).toBe(true));
      expect(result.current.disabledReason).toBe('No open round available.');
    });

    it('does not ask about a call without restrictions', () => {
      const { result } = renderHook(() =>
        usePublicCallApply(call(round('r-open', 'open'))),
      );
      expect(result.current.disabledReason).toBeUndefined();
      expect(
        proposalPublicCallsCheckEligibilityRetrieve,
      ).not.toHaveBeenCalled();
    });

    // The endpoint needs a user; Apply sends an anonymous visitor to log in.
    it('does not ask for an anonymous visitor', () => {
      vi.mocked(useUser).mockReturnValue(null as any);
      const { result } = renderHook(() =>
        usePublicCallApply(restricted(round('r-open', 'open'))),
      );
      expect(result.current.disabledReason).toBeUndefined();
      expect(
        proposalPublicCallsCheckEligibilityRetrieve,
      ).not.toHaveBeenCalled();
    });
  });
});
