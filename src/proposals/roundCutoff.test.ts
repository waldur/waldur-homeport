import { describe, expect, it } from 'vitest';

import { getSubmittableRounds } from '@/marketplace/offerings/apply/eligibleCalls';

import {
  formatRoundCutoff,
  isOpenEnded,
  openEndedRoundBlockedReason,
} from './roundCutoff';

describe('rounds without a cut-off', () => {
  it('tells an open-ended round from a dated one', () => {
    expect(isOpenEnded({ cutoff_time: null })).toBe(true);
    expect(isOpenEnded({ cutoff_time: '2027-01-01T00:00:00Z' })).toBe(false);
    expect(isOpenEnded(null)).toBe(false);
  });

  it('shows "Continuously open" instead of a cut-off date', () => {
    expect(formatRoundCutoff({ cutoff_time: null })).toBe('Continuously open');
    expect(formatRoundCutoff({ cutoff_time: '2027-01-01' }, () => 'date')).toBe(
      'date',
    );
    expect(formatRoundCutoff(undefined)).toBeNull();
  });

  it('allows one only when nothing waits for a cut-off', () => {
    const rolling = {
      evaluation_start: 'on_submission',
      publish_results: 'immediately',
    };
    expect(openEndedRoundBlockedReason(rolling, 'on_decision')).toBeNull();
    expect(
      openEndedRoundBlockedReason({
        ...rolling,
        evaluation_start: 'at_cutoff',
      }),
    ).toMatch(/evaluation/);
    expect(
      openEndedRoundBlockedReason({
        ...rolling,
        publish_results: 'with_round',
      }),
    ).toMatch(/publishes results/);
    expect(openEndedRoundBlockedReason(rolling, 'fixed_date')).toMatch(
      /fixed date/,
    );
  });

  it('lists an open-ended round after the dated ones', () => {
    const call = { uuid: 'c' } as any;
    const round = (uuid: string, cutoff_time: string | null) =>
      ({ uuid, status: 'open', cutoff_time }) as any;
    const rows = getSubmittableRounds([
      {
        ...call,
        rounds: [
          round('open-ended', null),
          round('late', '2027-02-01T00:00:00Z'),
          round('soon', '2027-01-01T00:00:00Z'),
        ],
      },
    ]);
    expect(rows.map((row) => row.uuid)).toEqual(['soon', 'late', 'open-ended']);
  });
});
