import { ProposalWorkflowStepInstance } from 'waldur-js-client';

import { sortByOrder } from '@/proposals/workflow/constants';

type StageStep = Pick<
  ProposalWorkflowStepInstance,
  | 'uuid'
  | 'call_step_uuid'
  | 'step_name'
  | 'status'
  | 'order'
  | 'contributor_source'
  | 'outcome_set'
>;

/**
 * A step whose work is the proposal's reviews: its contributors are the
 * reviewers assigned to the proposal, or it is completed as reviewed.
 */
export const isReviewStep = (
  step: Pick<StageStep, 'contributor_source' | 'outcome_set'>,
) =>
  step.contributor_source === 'assigned_reviewers' ||
  step.outcome_set === 'reviewed';

/** Where the proposal's reviews stand in its workflow. */
export type ReviewStage<T extends StageStep = StageStep> =
  | { kind: 'none' }
  | { kind: 'skipped'; step: T }
  | { kind: 'not_started'; step: T; previous?: T }
  | { kind: 'started'; step: T };

const STARTED = ['active', 'completed', 'expired'];

/**
 * The proposal's review step and how far it got: the one running now, else
 * the last one run, else the next one to run. Only when every review step was
 * skipped is the stage "skipped".
 */
export const reviewStage = <T extends StageStep>(
  states: T[] | null | undefined,
): ReviewStage<T> => {
  const steps = sortByOrder(states ?? []);
  const reviewSteps = steps.filter(isReviewStep);
  if (!reviewSteps.length) {
    return { kind: 'none' };
  }
  const live = reviewSteps.filter((step) => step.status !== 'skipped');
  if (!live.length) {
    return { kind: 'skipped', step: reviewSteps[0] };
  }
  const started =
    live.find((step) => step.status === 'active') ??
    [...live].reverse().find((step) => STARTED.includes(step.status));
  if (started) {
    return { kind: 'started', step: started };
  }
  const step = live[0];
  const previous = steps
    .slice(0, steps.indexOf(step))
    .reverse()
    .find((candidate) => candidate.status !== 'skipped');
  return { kind: 'not_started', step, previous };
};
