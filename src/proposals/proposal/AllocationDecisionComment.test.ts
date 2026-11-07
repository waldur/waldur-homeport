import { describe, expect, it } from 'vitest';

import { getAllocationDecisionComment } from './AllocationDecisionComment';

const decision = (overrides = {}) =>
  ({
    is_allocation_decision: true,
    status: 'completed',
    outcome: 'approved',
    outcome_reason: 'Awarded the cluster only.',
    ...overrides,
  }) as any;

describe('getAllocationDecisionComment', () => {
  it('is the comment of a recorded decision', () => {
    expect(getAllocationDecisionComment([decision()])).toBe(
      'Awarded the cluster only.',
    );
  });

  it('is nothing while the decision is still being made, or held', () => {
    // A held decision reaches the applicant as still active, its comment
    // stripped.
    expect(
      getAllocationDecisionComment([
        decision({ status: 'active', outcome_reason: '' }),
      ]),
    ).toBeUndefined();
  });

  it('is nothing for a decision without a comment', () => {
    expect(
      getAllocationDecisionComment([decision({ outcome_reason: '  ' })]),
    ).toBeUndefined();
    expect(getAllocationDecisionComment(undefined)).toBeUndefined();
  });
});
