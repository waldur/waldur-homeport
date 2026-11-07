import { describe, expect, it } from 'vitest';
import { ProposalWorkflowStepInstance } from 'waldur-js-client';

import { getApplicantTimeline } from './applicantTimeline';

const step = (
  props: Partial<ProposalWorkflowStepInstance> &
    Pick<ProposalWorkflowStepInstance, 'step' | 'status' | 'applicant_visible'>,
): ProposalWorkflowStepInstance =>
  ({
    uuid: props.step,
    step_name: `Name of ${props.step}`,
    step_description: 'internal description',
    responsible_role: 'call_manager',
    outcome: null,
    outcome_reason: '',
    rejection_reason: null,
    internal_notes: null,
    started_at: null,
    completed_at: null,
    completed_by: null,
    deadline: null,
    duration_in_days: null,
    is_required: false,
    checklist_status: null,
    ...props,
  }) as ProposalWorkflowStepInstance;

const names = (steps: ProposalWorkflowStepInstance[]) =>
  steps.map((s) => s.step_name);

describe('applicant timeline', () => {
  it('keeps the steps the call chose to expose, in order', () => {
    const result = getApplicantTimeline([
      step({
        step: 'expert_review',
        kind: 'assessment',
        outcome_set: 'reviewed',
        status: 'completed',
        applicant_visible: true,
      }),
      step({
        step: 'panel_review',
        kind: 'decision',
        outcome_set: 'approval',
        status: 'pending',
        applicant_visible: true,
      }),
    ]);

    expect(names(result)).toEqual([
      'Name of expert_review',
      'Name of panel_review',
    ]);
  });

  // The step's popover reads what the call exposed straight from it.
  it('passes an exposed step through with its own description and outcome', () => {
    const exposed = step({
      step: 'expert_review',
      kind: 'assessment',
      outcome_set: 'reviewed',
      status: 'completed',
      applicant_visible: true,
      step_description: 'Peer review by domain experts.',
      outcome: 'reviewed',
      outcome_reason: 'Scores consolidated.',
    });

    expect(getApplicantTimeline([exposed])).toEqual([exposed]);
  });

  it('drops an internal step that has already run', () => {
    // The steps around it carry the progress, so it leaves no trace.
    const result = getApplicantTimeline([
      step({
        step: 'administrative_check',
        kind: 'decision',
        outcome_set: 'eligibility',
        status: 'completed',
        applicant_visible: false,
      }),
      step({
        step: 'expert_review',
        kind: 'assessment',
        outcome_set: 'reviewed',
        status: 'pending',
        applicant_visible: true,
      }),
    ]);

    expect(names(result)).toEqual(['Name of expert_review']);
  });

  // The regression this file exists for. Dropping the active step lets the
  // stepper promote the next entry to "current" and name a stage the proposal
  // has not reached.
  it('stands up an unnamed placeholder for an internal step that is current', () => {
    const result = getApplicantTimeline([
      step({
        step: 'administrative_check',
        kind: 'decision',
        outcome_set: 'eligibility',
        status: 'active',
        applicant_visible: false,
      }),
      step({
        step: 'expert_review',
        kind: 'assessment',
        outcome_set: 'reviewed',
        status: 'pending',
        applicant_visible: true,
      }),
    ]);

    expect(names(result)).toEqual(['Internal check', 'Name of expert_review']);
    expect(result[0].status).toBe('active');
  });

  // The worse half of the same bug: with every visible step completed, dropping
  // the active one leaves a tracker that reads as finished on a proposal that
  // is still under review.
  it('never reports a proposal as finished while an internal step is running', () => {
    const result = getApplicantTimeline([
      step({
        step: 'expert_review',
        kind: 'assessment',
        outcome_set: 'reviewed',
        status: 'completed',
        applicant_visible: true,
      }),
      step({
        step: 'panel_review',
        kind: 'decision',
        outcome_set: 'approval',
        status: 'completed',
        applicant_visible: true,
      }),
      step({
        step: 'allocation_decision',
        kind: 'decision',
        outcome_set: 'approval',
        is_allocation_decision: true,
        status: 'active',
        applicant_visible: false,
      }),
    ]);

    expect(result.every((s) => s.status === 'completed')).toBe(false);
    expect(names(result).at(-1)).toBe('Decision');
  });

  it('withholds every detail the flag covers, not just the name', () => {
    const result = getApplicantTimeline([
      step({
        step: 'panel_review',
        kind: 'decision',
        outcome_set: 'approval',
        status: 'active',
        applicant_visible: false,
        step_description: 'Collective panel evaluation.',
        responsible_role: 'panel_member',
        outcome: 'rejected',
        outcome_reason: 'Scored below the cutoff',
        rejection_reason: 'Scored below the cutoff',
        internal_notes: 'Panel was split; chair broke the tie.',
        checklist_status: {
          has_checklist: true,
          checklist_required: true,
          checklist_name: 'Panel review',
          checklist_completed: false,
          unanswered_required_count: 2,
          can_read: true,
        },
      }),
    ]);

    expect(result[0]).toMatchObject({
      step_name: 'Internal check',
      step_description: 'A step the call team handles internally.',
      responsible_role: null,
      outcome: null,
      outcome_reason: '',
      rejection_reason: null,
      internal_notes: null,
      checklist_status: null,
    });
  });

  // The buttons render beside the tracker either way, so a stage name here
  // would contradict the page around it.
  it('names the one internal step the applicant has to act on', () => {
    const result = getApplicantTimeline([
      step({
        step: 'award_response',
        kind: 'applicant_action',
        outcome_set: 'acceptance',
        status: 'active',
        applicant_visible: false,
      }),
    ]);

    expect(names(result)).toEqual(['Awaiting your response']);
  });

  // Steps are told apart by kind and flags, not by the key a call gave them.
  it('recognises an award response and the decision under any name', () => {
    const award = getApplicantTimeline([
      step({
        step: 'accept-the-grant',
        kind: 'applicant_action',
        outcome_set: 'acceptance',
        status: 'active',
        applicant_visible: false,
      }),
    ]);
    const decision = getApplicantTimeline([
      step({
        step: 'board-decision',
        kind: 'decision',
        outcome_set: 'approval',
        is_allocation_decision: true,
        status: 'active',
        applicant_visible: false,
      }),
    ]);

    expect(names(award)).toEqual(['Awaiting your response']);
    expect(names(decision)).toEqual(['Decision']);
    // Their names already say what they are; neither carries the call's own
    // description.
    expect(award[0].step_description).toBe('');
    expect(decision[0].step_description).toBe('');
  });

  // An applicant step that answers with "submitted" is no award response.
  it('does not take any applicant step for the award response', () => {
    const result = getApplicantTimeline([
      step({
        step: 'response-to-reviews',
        kind: 'applicant_action',
        outcome_set: 'submitted',
        status: 'active',
        applicant_visible: false,
      }),
    ]);

    expect(names(result)).toEqual(['Internal check']);
  });

  it('leaves nothing behind when every step is internal and none is running', () => {
    // The coarse Submission -> Review -> Decision tracker takes over.
    const result = getApplicantTimeline([
      step({
        step: 'administrative_check',
        kind: 'decision',
        outcome_set: 'eligibility',
        status: 'completed',
        applicant_visible: false,
      }),
      step({
        step: 'expert_review',
        kind: 'assessment',
        outcome_set: 'reviewed',
        status: 'pending',
        applicant_visible: false,
      }),
    ]);

    expect(result).toEqual([]);
  });
});
