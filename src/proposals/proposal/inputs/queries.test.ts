import { describe, expect, it } from 'vitest';

import { isOfferingTeamStep } from './queries';

describe('isOfferingTeamStep', () => {
  it("is a step the requested offerings' teams contribute to", () => {
    expect(
      isOfferingTeamStep({
        contributor_source: 'requested_offering_team',
        completer: 'call_manager',
      }),
    ).toBe(true);
  });

  it('is a step offering managers complete', () => {
    expect(
      isOfferingTeamStep({
        contributor_source: 'none',
        completer: 'offering_manager',
      }),
    ).toBe(true);
  });

  // A provider holds no work on the applicant's or the panel's steps.
  it.each([
    ['none', 'applicant'],
    ['proposal_role:286', 'proposal_role'],
    ['assigned_reviewers', 'call_manager'],
  ])('is not a step of %s completed by %s', (source, completer) => {
    expect(
      isOfferingTeamStep({ contributor_source: source, completer } as any),
    ).toBe(false);
  });
});
