import { describe, expect, it } from 'vitest';

import { reviewerAssignmentBlocker } from './reviewerAssignment';

const step = (key: string, name: string, completer: string) => ({
  key,
  name,
  completer,
});

// A call reviewed by its pool: reviewers own the expert review step.
const poolReviewed = [
  step('eligibility', 'Eligibility check', 'call_manager'),
  step('expert_review', 'Expert review', 'reviewer'),
  step('decision', 'Decision', 'call_manager'),
] as any;

// A call reviewed through evaluator roles and panels: no step is the pool's.
const roleReviewed = [
  step('administrative_check', 'Administrative check', 'call_manager'),
  step('individual_reports', 'Individual reports', 'proposal_role'),
  step('allocation_decision', 'Allocation decision', 'call_manager'),
] as any;

const proposal = (state: string, workflow_step?: string) =>
  ({ state, workflow_step }) as any;

describe('reviewerAssignmentBlocker', () => {
  it.each([
    ['draft', 'The proposal is not submitted yet.'],
    ['canceled', 'The proposal was canceled.'],
    ['accepted', 'The proposal is already decided.'],
    ['rejected', 'The proposal is already decided.'],
  ])('refuses a %s proposal, saying why', (state, reason) => {
    expect(reviewerAssignmentBlocker(proposal(state), poolReviewed)).toBe(
      reason,
    );
  });

  it('takes a proposal under evaluation with no workflow step', () => {
    expect(reviewerAssignmentBlocker(proposal('submitted'))).toBeNull();
  });

  it("takes one at the step the call's reviewers own", () => {
    expect(
      reviewerAssignmentBlocker(
        proposal('in_review', 'expert_review'),
        poolReviewed,
      ),
    ).toBeNull();
  });

  it('refuses one at another step, naming the review steps', () => {
    expect(
      reviewerAssignmentBlocker(
        proposal('in_review', 'eligibility'),
        poolReviewed,
      ),
    ).toBe('Reviewers are assigned at: Expert review.');
  });

  it('takes one at any step of a call no step of which is the reviewers', () => {
    for (const key of ['administrative_check', 'individual_reports']) {
      expect(
        reviewerAssignmentBlocker(proposal('in_review', key), roleReviewed),
      ).toBeNull();
    }
  });

  it("goes by the default review steps without the call's steps", () => {
    expect(
      reviewerAssignmentBlocker(proposal('in_review', 'expert_review')),
    ).toBeNull();
    expect(
      reviewerAssignmentBlocker(proposal('in_review', 'eligibility')),
    ).toBe('Reviewers are assigned at a review step.');
  });
});
