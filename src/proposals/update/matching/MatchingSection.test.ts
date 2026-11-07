import { describe, expect, it } from 'vitest';

import { constraintRows, DEFAULT_CONFIG } from './MatchingSection';

const valueOf = (key: string, config: any) =>
  constraintRows.find((row) => row.key === key).getValue(config);

describe('Matching constraints', () => {
  // The backend model defaults: 3 and 5 reviewers per proposal, 10 proposals
  // per reviewer. Generate assignments uses the minimum as its target.
  it.each([
    ['min_reviewers_per_proposal', '3'],
    ['max_reviewers_per_proposal', '5'],
    ['max_proposals_per_reviewer', '10'],
  ])('shows the default %s when none is saved', (key, value) => {
    expect(valueOf(key, {})).toBe(value);
    expect(valueOf(key, undefined)).toBe(value);
    expect(String(DEFAULT_CONFIG[key])).toBe(value);
  });

  it('shows the minimum affinity as a percentage', () => {
    expect(valueOf('min_affinity_threshold', {})).toBe('10%');
    expect(
      valueOf('min_affinity_threshold', { min_affinity_threshold: 0.25 }),
    ).toBe('25%');
  });

  it('shows the saved value', () => {
    expect(
      valueOf('min_reviewers_per_proposal', { min_reviewers_per_proposal: 4 }),
    ).toBe('4');
  });
});
