import { CallWorkflowStep, Proposal } from 'waldur-js-client';

import { translate } from '@/i18n';
import { isReviewBearingStep } from '@/proposals/workflow/constants';

/** A review is assigned while the proposal is under evaluation. */
export const ASSIGNABLE_STATES: Proposal['state'][] = [
  'submitted',
  'in_review',
];

/**
 * Why no reviewer from the pool can be assigned to the proposal now, or null
 * when one can.
 *
 * The backend takes any proposal under evaluation. A call whose workflow has
 * steps its reviewers own takes them at those steps only, so that nobody is
 * asked to review during the eligibility check, before there is anything to
 * review. A call with no such step -- one reviewed through evaluator roles and
 * panels -- takes them at any step, as the backend does.
 *
 * Without the call's steps, only the default review steps are recognised.
 */
export const reviewerAssignmentBlocker = (
  proposal: Pick<Proposal, 'state' | 'workflow_step'>,
  callSteps?: Pick<CallWorkflowStep, 'key' | 'name' | 'completer'>[],
): string | null => {
  if (proposal.state === 'draft') {
    return translate('The proposal is not submitted yet.');
  }
  if (proposal.state === 'canceled') {
    return translate('The proposal was canceled.');
  }
  if (!ASSIGNABLE_STATES.includes(proposal.state)) {
    return translate('The proposal is already decided.');
  }
  const step = proposal.workflow_step;
  if (!step) {
    return null;
  }
  if (!callSteps) {
    return isReviewBearingStep(step)
      ? null
      : translate('Reviewers are assigned at a review step.');
  }
  const reviewSteps = callSteps.filter((s) =>
    isReviewBearingStep(s.key, callSteps),
  );
  if (!reviewSteps.length || reviewSteps.some((s) => s.key === step)) {
    return null;
  }
  return translate('Reviewers are assigned at: {steps}.', {
    steps: reviewSteps.map((s) => s.name).join(', '),
  });
};
