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
        status: 'completed',
        applicant_visible: true,
      }),
      step({
        step: 'panel_review',
        status: 'pending',
        applicant_visible: true,
      }),
    ]);

    expect(names(result)).toEqual([
      'Name of expert_review',
      'Name of panel_review',
    ]);
  });

  it('drops an internal step that has already run', () => {
    // The steps around it carry the progress, so it leaves no trace.
    const result = getApplicantTimeline([
      step({
        step: 'administrative_check',
        status: 'completed',
        applicant_visible: false,
      }),
      step({
        step: 'expert_review',
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
        status: 'active',
        applicant_visible: false,
      }),
      step({
        step: 'expert_review',
        status: 'pending',
        applicant_visible: true,
      }),
    ]);

    expect(names(result)).toEqual(['In review', 'Name of expert_review']);
    expect(result[0].status).toBe('active');
  });

  // The worse half of the same bug: with every visible step completed, dropping
  // the active one leaves a tracker that reads as finished on a proposal that
  // is still under review.
  it('never reports a proposal as finished while an internal step is running', () => {
    const result = getApplicantTimeline([
      step({
        step: 'expert_review',
        status: 'completed',
        applicant_visible: true,
      }),
      step({
        step: 'panel_review',
        status: 'completed',
        applicant_visible: true,
      }),
      step({
        step: 'allocation_decision',
        status: 'active',
        applicant_visible: false,
      }),
    ]);

    expect(result.every((s) => s.status === 'completed')).toBe(false);
    expect(names(result).at(-1)).toBe('In review');
  });

  it('withholds every detail the flag covers, not just the name', () => {
    const result = getApplicantTimeline([
      step({
        step: 'panel_review',
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
        },
      }),
    ]);

    expect(result[0]).toMatchObject({
      step_name: 'In review',
      step_description: '',
      responsible_role: null,
      outcome: null,
      outcome_reason: '',
      rejection_reason: null,
      internal_notes: null,
      checklist_status: null,
    });
  });

  // The buttons render beside the tracker either way, so "In review" here would
  // contradict the page around it.
  it('names the one internal step the applicant has to act on', () => {
    const result = getApplicantTimeline([
      step({
        step: 'award_response',
        status: 'active',
        applicant_visible: false,
      }),
    ]);

    expect(names(result)).toEqual(['Awaiting your response']);
  });

  it('leaves nothing behind when every step is internal and none is running', () => {
    // The coarse Submission -> Review -> Decision tracker takes over.
    const result = getApplicantTimeline([
      step({
        step: 'administrative_check',
        status: 'completed',
        applicant_visible: false,
      }),
      step({
        step: 'expert_review',
        status: 'pending',
        applicant_visible: false,
      }),
    ]);

    expect(result).toEqual([]);
  });
});
