import { describe, expect, it } from 'vitest';

import { getOpenByDefault } from './useProposalSections';

const step = (uuid: string, overrides = {}) =>
  ({
    uuid: `state-${uuid}`,
    step: uuid,
    call_step_uuid: uuid,
    kind: 'assessment',
    status: 'pending',
    ...overrides,
  }) as any;

const sorted = (open: Set<string>) => Array.from(open).sort();

const situation = ({
  state = 'in_review',
  steps,
  active,
  onApplicantTeam = false,
  releasable = [],
}: {
  state?: string;
  steps: any[];
  active?: any;
  onApplicantTeam?: boolean;
  releasable?: unknown[];
}) =>
  sorted(
    getOpenByDefault({
      proposal: { state } as any,
      workflowStates: steps,
      activeStep: active,
      onApplicantTeam,
      releasable,
    }),
  );

const ALWAYS_FOLDED = [
  'step-project',
  'step-resource-requests',
  'step-compliance',
  'step-team',
];

describe('getOpenByDefault', () => {
  it('opens the current step for the call manager while evaluating', () => {
    const questions = step('questions', {
      status: 'active',
      collects_reviewer_suggestions: true,
    });
    const steps = [step('admin', { status: 'completed' }), questions];
    const open = situation({ steps, active: questions });
    expect(open).toEqual(
      [
        'step-general',
        'step-contributions-questions',
        'step-inputs-questions',
        'step-response-questions',
        'step-checklist',
        'step-my-reviewer-suggestions',
        'step-suggested-reviewers',
      ].sort(),
    );
    // A finished step's contributions fold.
    expect(open).not.toContain('step-contributions-admin');
    ALWAYS_FOLDED.forEach((id) => expect(open).not.toContain(id));
  });

  it('opens the evaluators while an assignment step runs', () => {
    const assign = step('assign', { status: 'active', kind: 'assignment' });
    expect(situation({ steps: [assign], active: assign })).toContain(
      'step-evaluators',
    );
  });

  it('opens the suggested reviewers while they are assigned after collection', () => {
    const questions = step('questions', {
      status: 'completed',
      collects_reviewer_suggestions: true,
    });
    const assign = step('reviewer_assignment', {
      status: 'active',
      kind: 'assignment',
    });
    const open = situation({ steps: [questions, assign], active: assign });
    expect(open).toContain('step-suggested-reviewers');
    expect(open).not.toContain('step-my-reviewer-suggestions');
  });

  it('keeps them folded at an assignment before any were collected', () => {
    const assign = step('rapporteur_assignment', {
      status: 'active',
      kind: 'assignment',
    });
    const questions = step('questions', {
      status: 'pending',
      collects_reviewer_suggestions: true,
    });
    expect(
      situation({ steps: [assign, questions], active: assign }),
    ).not.toContain('step-suggested-reviewers');
  });

  it('opens the outcome and award once decided, and folds the steps', () => {
    const decision = step('decision', {
      status: 'completed',
      is_allocation_decision: true,
    });
    const award = step('award_response', { status: 'active' });
    const open = situation({
      state: 'accepted',
      steps: [step('questions', { status: 'completed' }), decision, award],
      active: award,
    });
    expect(open).toEqual(
      [
        'step-general',
        'step-allocation-outcome',
        'step-awarded-resources',
        'step-released-reports',
      ].sort(),
    );
  });

  it('opens what the applicant must answer at a response step', () => {
    const response = step('response', {
      status: 'active',
      kind: 'applicant_action',
    });
    const open = situation({
      steps: [response],
      active: response,
      onApplicantTeam: true,
    });
    expect(open).toContain('step-response-response');
    expect(open).toContain('step-released-reports');
    ALWAYS_FOLDED.forEach((id) => expect(open).not.toContain(id));
  });

  it('opens the outcome and feedback to the applicant after publication', () => {
    const decision = step('decision', {
      status: 'completed',
      is_allocation_decision: true,
    });
    const open = situation({
      state: 'accepted',
      steps: [decision],
      onApplicantTeam: true,
    });
    expect(open).toEqual(
      [
        'step-general',
        'step-allocation-outcome',
        'step-awarded-resources',
        'step-released-reports',
      ].sort(),
    );
  });

  it('opens the award the applicant is asked to accept', () => {
    // A decision held for the round's publication reaches the applicant as
    // still being made; once released, the award response is theirs.
    const award = step('award_response', { status: 'active' });
    const open = situation({
      steps: [step('decision', { status: 'active' }), award],
      active: award,
      onApplicantTeam: true,
    });
    expect(open).toContain('step-awarded-resources');
  });

  it('opens a rapporteur’s open contribution and nothing else of theirs', () => {
    const report = step('report', { status: 'active' });
    const open = situation({
      steps: [step('questions', { status: 'completed' }), report],
      active: report,
    });
    expect(open).toContain('step-contributions-report');
    expect(open).not.toContain('step-contributions-questions');
    expect(open).not.toContain('step-released-reports');
    expect(open).not.toContain('step-evaluators');
  });

  it('opens the reports the viewer may release', () => {
    expect(situation({ steps: [], releasable: [step('report')] })).toContain(
      'step-released-reports',
    );
  });
});
