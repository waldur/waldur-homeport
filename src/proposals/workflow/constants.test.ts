import { describe, expect, it } from 'vitest';
import { StepKind } from 'waldur-js-client';

import {
  contributionStatusHint,
  contributionStatusLabel,
  findAllocationDecision,
  hasNegativeOutcome,
  isAwardResponseStep,
  isReviewBearingStep,
  isTechnicalAssessmentStep,
  kindHasField,
  responsibleRoleLabel,
  stepName,
} from './constants';

const decisionKind: StepKind = {
  id: 'decision',
  name: 'Decision',
  description: '',
  outcome_sets: [
    {
      id: 'approval',
      name: 'Approved / declined',
      outcomes: ['approved', 'declined'],
    },
    {
      id: 'eligibility',
      name: 'Eligible / ineligible',
      outcomes: ['eligible', 'ineligible'],
    },
  ],
  default_outcome_set: 'approval',
  default_completer: 'call_manager',
  config_fields: ['name', 'is_allocation_decision', 'allocation_time'],
  default_notification_rules: [],
  applicant_facing: false,
};

describe('step recognition', () => {
  it('takes an applicant step answering accept / decline for the award response', () => {
    expect(
      isAwardResponseStep({
        kind: 'applicant_action',
        outcome_set: 'acceptance',
      }),
    ).toBe(true);
    expect(
      isAwardResponseStep({
        kind: 'applicant_action',
        outcome_set: 'submitted',
      }),
    ).toBe(false);
    expect(
      isAwardResponseStep({ kind: 'decision', outcome_set: 'acceptance' }),
    ).toBe(false);
  });

  it('takes an assessment ruling on feasibility for a technical assessment', () => {
    expect(
      isTechnicalAssessmentStep({
        kind: 'assessment',
        outcome_set: 'feasibility',
      }),
    ).toBe(true);
    expect(
      isTechnicalAssessmentStep({
        kind: 'assessment',
        outcome_set: 'reviewed',
      }),
    ).toBe(false);
  });

  it('finds the enabled allocation decision before a disabled one', () => {
    const steps = [
      { key: 'old', is_allocation_decision: true, is_enabled: false },
      { key: 'new', is_allocation_decision: true, is_enabled: true },
      { key: 'other', is_allocation_decision: false, is_enabled: true },
    ];
    expect(findAllocationDecision(steps)?.key).toBe('new');
    expect(findAllocationDecision([steps[0]])?.key).toBe('old');
    expect(findAllocationDecision(undefined)).toBeUndefined();
  });

  it("names a step by the call's name for it, else by its key", () => {
    expect(
      stepName({ name: 'Individual report', key: 'individual-report' }),
    ).toBe('Individual report');
    expect(stepName({ name: '', key: 'individual-report' })).toBe(
      'individual-report',
    );
    expect(stepName({ step_name: 'Panel review', step: 'panel_review' })).toBe(
      'Panel review',
    );
  });
});

describe('kind configuration', () => {
  it('offers only the fields the kind is configured with', () => {
    expect(kindHasField(decisionKind, 'allocation_time')).toBe(true);
    expect(kindHasField(decisionKind, 'criteria')).toBe(false);
    expect(kindHasField(undefined, 'name')).toBe(false);
  });

  it('knows which outcome sets can stop a proposal', () => {
    expect(hasNegativeOutcome(decisionKind, 'approval')).toBe(true);
    expect(
      hasNegativeOutcome(
        {
          ...decisionKind,
          outcome_sets: [{ id: 'done', name: 'Done', outcomes: ['done'] }],
        },
        'done',
      ),
    ).toBe(false);
  });
});

describe('isReviewBearingStep', () => {
  const callSteps = [
    { key: 'individual-report', completer: 'reviewer' },
    { key: 'board', completer: 'call_manager' },
  ] as any;

  it("asks the call's steps who completes the current one", () => {
    expect(isReviewBearingStep('individual-report', callSteps)).toBe(true);
    expect(isReviewBearingStep('board', callSteps)).toBe(false);
  });

  // Without the call's steps, only the default review steps are known.
  it.each(['expert_review', 'panel_review'])(
    'accepts %s, whose work the reviewers do',
    (step) => {
      expect(isReviewBearingStep(step)).toBe(true);
    },
  );

  it.each([
    'administrative_check',
    'technical_assessment',
    'allocation_decision',
    'award_response',
  ])('rejects %s, where no review is due yet', (step) => {
    expect(isReviewBearingStep(step)).toBe(false);
  });

  // A proposal on a call that runs no workflow has no active step; callers
  // treat that as "unrestricted", so this must not claim otherwise.
  it('rejects an absent step', () => {
    expect(isReviewBearingStep(null)).toBe(false);
    expect(isReviewBearingStep(undefined)).toBe(false);
  });
});

describe('responsibleRoleLabel', () => {
  it('names the holders of an evaluator role as a completer', () => {
    expect(responsibleRoleLabel('proposal_role')).toBe('Evaluator role');
  });
});

describe('contribution status', () => {
  it('calls a lapsed contribution paused while its step runs', () => {
    expect(contributionStatusLabel('expired', true)).toBe('Paused');
    expect(contributionStatusHint('expired', true)).toMatch(
      /^Paused: the contributor no longer holds the role or has a conflict of interest/,
    );
  });

  it('calls it expired once the step has ended', () => {
    expect(contributionStatusLabel('expired')).toBe('Expired');
    expect(contributionStatusHint('expired', false)).toBe(
      'The step ended before this contribution was submitted.',
    );
  });

  it('explains a withdrawal and leaves open slots unexplained', () => {
    expect(contributionStatusLabel('withdrawn', true)).toBe('Withdrawn');
    expect(contributionStatusHint('withdrawn', true)).toBe(
      'Withdrawn by a call manager, or closed when the step was decided or the contributor joined the applicant team.',
    );
    expect(contributionStatusHint('pending', true)).toBe('');
  });
});
