import {
  CompleteRoundRefusal,
  LifecycleStateEnum,
  NestedRound,
  OutcomeEnum,
  PublishResultsEnum,
  PublishRoundResultsRefusal,
  UndecidedAtRoundCompletionEnum,
} from 'waldur-js-client';

import { BadgeVariant } from 'waldur-ui';

import { getErrorBody } from '@/core/ErrorMessageFormatter';
import { translate } from '@/i18n';

type RoundLifecycleState = LifecycleStateEnum | '' | null | undefined;

/**
 * The workflow step whose outcome a round holds back until it publishes
 * results: the allocation decision.
 */
export const HELD_DECISION_STEP = 'allocation_decision';

/**
 * Where a round stands after its cut-off. Before the cut-off the backend
 * stores nothing and the round's own status (scheduled / open) says it all.
 */
export const getRoundLifecycleState = (
  state: RoundLifecycleState,
): { label: string; color: BadgeVariant } | null => {
  switch (state) {
    case 'evaluating':
      return { label: translate('Evaluating'), color: 'warning' };
    case 'deciding':
      return { label: translate('Deciding'), color: 'info' };
    case 'results_published':
      return { label: translate('Results published'), color: 'success' };
    case 'closed':
      return { label: translate('Closed'), color: 'neutral' };
    default:
      return null;
  }
};

export const getPublishResultsOptions = (): {
  value: PublishResultsEnum;
  label: string;
}[] => [
  { value: 'immediately', label: translate('As each decision is made') },
  { value: 'with_round', label: translate('Together for the whole round') },
];

export const getUndecidedAtCompletionOptions = (): {
  value: UndecidedAtRoundCompletionEnum;
  label: string;
}[] => [
  {
    value: 'refuse',
    label: translate('Block completion until every proposal is decided'),
  },
  { value: 'reject', label: translate('Reject them automatically') },
];

export const undecidedAtCompletionLabel = (
  rule: UndecidedAtRoundCompletionEnum,
) =>
  getUndecidedAtCompletionOptions().find((o) => o.value === rule)?.label ??
  rule;

/**
 * What completing the round does with proposals still without a decision:
 * the round's own rule where it sets one, else the call's.
 */
export const getEffectiveCompletionRule = (
  round: { undecided_at_round_completion?: string | null },
  call: { undecided_at_round_completion?: UndecidedAtRoundCompletionEnum },
): { rule: UndecidedAtRoundCompletionEnum; inherited: boolean } => {
  const own = round.undecided_at_round_completion;
  if (own === 'refuse' || own === 'reject') {
    return { rule: own, inherited: false };
  }
  return {
    rule: call.undecided_at_round_completion ?? 'refuse',
    inherited: true,
  };
};

export interface RoundLifecycleActions {
  close: boolean;
  startDeciding: boolean;
  publishResults: boolean;
  complete: boolean;
  completionRule: boolean;
  recordAdoption: boolean;
}

/**
 * Which lifecycle actions apply to the round, mirroring the transitions the
 * backend accepts. An open round can be closed early, which moves its cut-off
 * to now; a scheduled one is deleted instead. After the cut-off:
 * evaluating → deciding → results_published → closed.
 * Results may be published straight from evaluating, skipping the decision
 * phase, and published again while decisions whose release failed are still
 * held. The adoption can be recorded at any point after the cut-off.
 */
export const getRoundLifecycleActions = (
  round: Pick<NestedRound, 'status' | 'lifecycle_state'> & {
    held_decisions_count?: number | null;
  },
): RoundLifecycleActions => {
  const ended = round.status === 'ended';
  const state = round.lifecycle_state;
  // A round past its cut-off that the hourly sweep has not reached yet has no
  // stored state; the backend starts its evaluation on the first action.
  const evaluating = ended && (!state || state === 'evaluating');
  return {
    close: round.status === 'open',
    startDeciding: evaluating,
    publishResults:
      evaluating ||
      state === 'deciding' ||
      (ended &&
        state === 'results_published' &&
        (round.held_decisions_count ?? 0) > 0),
    complete: ended && state === 'results_published',
    // The rule matters until the round is completed.
    completionRule: state !== 'closed',
    recordAdoption: ended,
  };
};

/**
 * Whether the viewer is shown the round's adoption record (adoption note and
 * document, and why results were published early). While a round holds its
 * decisions for publication the record states the outcome, so the backend
 * withholds it (sends null) from anyone who may not see held decisions --
 * the same viewers for whom `held_decisions_count` is null. Once the results
 * are published, or when the call announces each decision at once, everyone
 * on the call team sees it.
 */
export const canViewRoundAdoption = (
  round: {
    lifecycle_state?: RoundLifecycleState;
    held_decisions_count?: number | null;
  },
  call?: { publish_results?: PublishResultsEnum },
): boolean =>
  call?.publish_results === 'immediately' ||
  round.lifecycle_state === 'results_published' ||
  round.lifecycle_state === 'closed' ||
  typeof round.held_decisions_count === 'number';

/**
 * How a decision held for the round's publication reads to the call team.
 * The outcome is recorded on the allocation decision step; the applicant
 * still sees the proposal as being evaluated.
 */
export const heldDecisionLabel = (
  outcome: OutcomeEnum | string | null | undefined,
): string => {
  switch (outcome) {
    case 'approved':
      return translate('Awarded (tentative)');
    case 'declined':
    case 'rejected':
      return translate('Not awarded (tentative)');
    case 'expired':
      return translate('Decision lapsed (tentative)');
    default:
      return translate('Decision held');
  }
};

export const heldDecisionVariant = (
  outcome: OutcomeEnum | string | null | undefined,
): BadgeVariant => {
  switch (outcome) {
    case 'approved':
      return 'primary';
    case 'declined':
    case 'rejected':
      return 'danger';
    default:
      return 'warning';
  }
};

/**
 * The backend refuses to publish a round's results while some of its
 * proposals have no decision, and says how many in `undecided_count`. Returns
 * that count and the backend's message, or null for any other error (whose
 * detail the caller reports as usual).
 */
export const getUndecidedRefusal = (
  error: any,
): { count: number; detail: string } | null => {
  // The SDK client throws the parsed body with the envelope (status,
  // response, ...) spread alongside it; getErrorBody strips the envelope.
  const status = error?.status ?? error?.response?.status;
  if (status !== 400) return null;
  const body = getErrorBody(error) as
    Partial<PublishRoundResultsRefusal> | undefined;
  if (typeof body?.undecided_count !== 'number') return null;
  return { count: body.undecided_count, detail: body.detail ?? '' };
};

/**
 * The backend refuses to complete a round while decisions whose release
 * failed at publication are still held, and says how many in
 * `held_decisions_count`. Returns that count and the backend's message, or
 * null for any other error.
 */
export const getHeldDecisionsRefusal = (
  error: any,
): { count: number; detail: string } | null => {
  const status = error?.status ?? error?.response?.status;
  if (status !== 400) return null;
  const body = getErrorBody(error) as Partial<CompleteRoundRefusal> | undefined;
  if (typeof body?.held_decisions_count !== 'number') return null;
  return { count: body.held_decisions_count, detail: body.detail ?? '' };
};
