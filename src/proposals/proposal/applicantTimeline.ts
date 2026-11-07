import { ProposalWorkflowStepInstance } from 'waldur-js-client';

import { translate } from '@/i18n';
import {
  isAllocationDecisionStep,
  isAwardResponseStep,
} from '@/proposals/workflow/constants';

/**
 * What an internal step is called on the applicant's tracker, and the line
 * that explains it: the stage it stands for, never the call's own name or
 * description for it. Reusing the proposal's "In review" badge read as a step
 * back into review once a review step had already been ticked off.
 */
const placeholder = (
  step: ProposalWorkflowStepInstance,
): { name: string; description: string } => {
  if (isAwardResponseStep(step)) {
    // The one internal step the applicant has to act on: the response
    // buttons render beside the tracker either way, so a stage name here
    // would contradict the page around it.
    return { name: translate('Awaiting your response'), description: '' };
  }
  if (isAllocationDecisionStep(step)) {
    return { name: translate('Decision'), description: '' };
  }
  // Anything else is a check the call team runs on its own. Calling it
  // "Evaluation" passed it off as the review the applicant was waiting for;
  // the neutral name says what it is without saying which check it is.
  return {
    name: translate('Internal check'),
    description: translate('A step the call team handles internally.'),
  };
};

/**
 * A step the call keeps internal, reduced to the one fact the applicant needs:
 * that it is the stage they are sitting at.
 *
 * Everything `applicant_visible` withholds is stripped rather than relabelled —
 * the name, the description (replaced by the stand-in's own explanation), who
 * is responsible, and the outcome with its reason. The rejection reason goes
 * too: a proposal that failed at an internal step still reads as failed,
 * because the timeline's failure lookup falls back to the first non-completed
 * entry once the proposal itself is rejected, but the call's own words for why
 * are step detail the flag does not grant.
 */
const anonymise = (
  step: ProposalWorkflowStepInstance,
): ProposalWorkflowStepInstance => {
  const { name, description } = placeholder(step);
  return {
    ...step,
    step_name: name,
    step_description: description,
    completer: null,
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
  };
};

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
 * finished on a proposal still under review. It is stood up under the name of
 * its stage instead.
 *
 * Steps of one stage may be active at once: they stand for one stage, so
 * they get one placeholder between them, and the count of internal steps
 * stays hidden. A visible step of the stage already marks it as current, so
 * none is added beside one.
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
    } else if (
      step.status === 'active' &&
      !live.some(
        (other) =>
          other !== step &&
          other.status === 'active' &&
          other.stage === step.stage &&
          (other.applicant_visible || live.indexOf(other) < live.indexOf(step)),
      )
    ) {
      acc.push(anonymise(step));
    }
    return acc;
  }, []);
