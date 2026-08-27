import { ProposalWorkflowStepInstance } from 'waldur-js-client';

import { translate } from '@/i18n';

/**
 * A step the call keeps internal, reduced to the one fact the applicant needs:
 * that it is the stage they are sitting at.
 *
 * Everything `applicant_visible` withholds is stripped rather than relabelled —
 * the name, the description, who is responsible, and the outcome with its
 * reason. The rejection reason goes too: a proposal that failed at an internal
 * step still reads as failed, because the timeline's failure lookup falls back
 * to the first non-completed entry once the proposal itself is rejected, but
 * the call's own words for why are step detail the flag does not grant.
 */
const anonymise = (
  step: ProposalWorkflowStepInstance,
): ProposalWorkflowStepInstance => ({
  ...step,
  step_name:
    step.step === 'award_response'
      ? // The one internal step the applicant has to act on: the response
        // buttons render beside the tracker either way, so "In review" here
        // would contradict the page around it.
        translate('Awaiting your response')
      : translate('In review'),
  step_description: '',
  responsible_role: null,
  outcome: null,
  outcome_reason: '',
  rejection_reason: null,
  // Nothing renders these today, but the object claims to be anonymised and
  // is handed to a view layer that may grow: leaving the call team's own
  // notes and checklist progress riding along inside it would make the claim
  // false the first time something reaches for them.
  internal_notes: null,
  checklist_status: null,
});

/**
 * The steps an applicant may see, from the full list the API returns.
 *
 * `applicant_visible` is the call manager's own decision about which steps they
 * expose, and it governs the *name* of a step, not its existence. A hidden step
 * that has already run leaves no trace: the steps around it carry the progress.
 * A hidden step that is *current* cannot just be dropped, because the stepper
 * marks the first non-completed entry as the current one — so removing it
 * either promotes a later step and names a stage the proposal has not reached,
 * or, where every remaining entry is completed, paints the whole tracker as
 * finished on a proposal still under review. It is stood up unnamed instead.
 *
 * Only one step is ever active, so no two placeholders can appear at once and
 * the count of internal steps stays hidden.
 *
 * Callers pass the already-live list (skipped steps removed); the call team's
 * own view does not come through here at all.
 */
export const getApplicantTimeline = (
  live: ProposalWorkflowStepInstance[],
): ProposalWorkflowStepInstance[] =>
  live.reduce<ProposalWorkflowStepInstance[]>((acc, step) => {
    if (step.applicant_visible) {
      acc.push(step);
    } else if (step.status === 'active') {
      acc.push(anonymise(step));
    }
    return acc;
  }, []);
