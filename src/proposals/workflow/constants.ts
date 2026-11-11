import {
  CallStepKindEnum,
  CallWorkflowStep,
  OnNegativeEnum,
  ResponsibleRoleEnum,
  StepKind,
  TransitionModeEnum,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';

// Outcome wording lives in waldur-proposals, which the micro-apps share.
export {
  contributionOutcomeLabel,
  contributionStatusHint,
  contributionStatusLabel,
  outcomeLabel,
} from 'waldur-proposals';

export type { ResponsibleRoleEnum, TransitionModeEnum };

/**
 * What every view of a step needs to tell steps apart. A call composes its
 * workflow from named steps of a few kinds, and a kind may appear more than
 * once, so a step is recognised by its kind, its outcome set and its flags --
 * never by its key, which is just whatever the call manager named it.
 */
interface StepShape {
  kind?: CallStepKindEnum | null;
  outcome_set?: string | null;
  is_allocation_decision?: boolean | null;
}

/** The step's own name, falling back to its key. */
export const stepName = (step: {
  name?: string | null;
  step_name?: string | null;
  key?: string | null;
  step?: string | null;
}): string => step.name || step.step_name || step.key || step.step || '';

/** The applicant's answer to an award: an applicant step accepting or declining. */
export const isAwardResponseStep = (step: StepShape | null | undefined) =>
  step?.kind === 'applicant_action' && step.outcome_set === 'acceptance';

/** A technical assessment: an assessment that rules on feasibility. */
export const isTechnicalAssessmentStep = (step: StepShape | null | undefined) =>
  step?.kind === 'assessment' &&
  (step.outcome_set === 'feasibility' || step.outcome_set === 'per_offering');

/** The decision step that settles the award. */
export const isAllocationDecisionStep = (step: StepShape | null | undefined) =>
  Boolean(step?.is_allocation_decision);

/**
 * The call's allocation decision: the enabled one, which a call has exactly
 * one of once it is active, else any (a draft call may have it switched off).
 */
export const findAllocationDecision = <
  T extends StepShape & { is_enabled?: boolean },
>(
  steps: T[] | null | undefined,
): T | undefined =>
  (steps ?? []).find(
    (s) => s.is_allocation_decision && s.is_enabled !== false,
  ) ?? (steps ?? []).find((s) => s.is_allocation_decision);

/** The call's steps in the order the workflow runs them. */
export const sortByOrder = <T extends { order: number }>(steps: T[]): T[] =>
  [...steps].sort((a, b) => a.order - b.order);

/** Roles whose work is reviewing the proposal. */
const REVIEWING_ROLES: string[] = ['reviewer', 'panel_member'];

/** Whether a step completed by `completer` is one the reviewers carry out. */
const isReviewingCompleter = (completer: string | null | undefined) =>
  Boolean(completer && REVIEWING_ROLES.includes(completer));

/**
 * Keys of the steps a new call starts with whose work the reviewers do.
 * Only for a proposal whose current step is known by key alone and whose
 * call steps are not at hand.
 */
const DEFAULT_REVIEW_STEP_KEYS = ['expert_review', 'panel_review'];

/**
 * Whether assigning a review is part of what the proposal's current step is
 * for. The call's steps say who completes it; without them only the default
 * review steps are recognised.
 */
export const isReviewBearingStep = (
  key: string | null | undefined,
  callSteps?: Pick<CallWorkflowStep, 'key' | 'completer'>[],
): boolean => {
  if (!key) return false;
  const configured = callSteps?.find((s) => s.key === key);
  if (configured) return isReviewingCompleter(configured.completer);
  return DEFAULT_REVIEW_STEP_KEYS.includes(key);
};

/** The kind definition of `kind`, from the kinds endpoint. */
export const findKind = (
  kinds: StepKind[] | null | undefined,
  kind: CallStepKindEnum | null | undefined,
): StepKind | undefined => (kinds ?? []).find((k) => k.id === kind);

/** Whether a step of `kind` is configured with `field`. */
export const kindHasField = (kind: StepKind | undefined, field: string) =>
  Boolean(kind?.config_fields.includes(field));

/** The display name of `kind`, as the kinds endpoint has it. */
export const kindLabel = (
  kinds: StepKind[] | null | undefined,
  kind: CallStepKindEnum,
): string => findKind(kinds, kind)?.name ?? kind;

/** Outcomes that end the workflow negatively, unless the step says cancel. */
const NEGATIVE_OUTCOMES: string[] = ['ineligible', 'infeasible', 'declined'];

/** Whether an outcome set has an outcome that stops the proposal. */
export const hasNegativeOutcome = (
  kind: StepKind | undefined,
  outcomeSet: string | null | undefined,
) =>
  Boolean(
    kind?.outcome_sets
      .find((s) => s.id === outcomeSet)
      ?.outcomes.some((o) => NEGATIVE_OUTCOMES.includes(o)),
  );

export const onNegativeLabel = (value: OnNegativeEnum | string) => {
  switch (value) {
    case 'reject':
      return translate('Reject the proposal');
    case 'cancel':
      return translate('Cancel the proposal');
    case 'continue':
      return translate('Continue to the next step');
    default:
      return value;
  }
};

export const ON_NEGATIVE_OPTIONS: OnNegativeEnum[] = [
  'reject',
  'cancel',
  'continue',
];

/** Contributor sources a call manager picks from; see contributorSourceLabel. */
export const CONTRIBUTOR_SOURCE_OPTIONS = [
  'none',
  'requested_offering_team',
  'assigned_reviewers',
  'call_role:call_manager',
  'call_role:reviewer',
  'call_role:panel_member',
  'call_role:panel_chair',
] as const;

export const contributorSourceLabel = (source: string): string => {
  switch (source) {
    case 'none':
      return translate('Whoever completes the step');
    case 'requested_offering_team':
      return translate('The team of each requested offering');
    case 'assigned_reviewers':
      return translate('Assigned reviewers');
    case 'call_role:call_manager':
      return translate('Call managers');
    case 'call_role:reviewer':
      return translate('Call reviewers');
    case 'call_role:panel_member':
      return translate('Panel members');
    case 'call_role:panel_chair':
      return translate('Panel chair and vice-chair');
    default:
      return source.startsWith('proposal_role:')
        ? translate('Holders of an evaluator role')
        : source;
  }
};

export const statusLabel = (status: string) => {
  switch (status) {
    case 'completed':
      return translate('Completed');
    case 'active':
      return translate('In progress');
    case 'expired':
      return translate('Overdue');
    case 'pending':
      return translate('Pending');
    case 'skipped':
      return translate('Skipped');
    case 'withdrawn':
      return translate('Withdrawn');
    default:
      return status;
  }
};

/** The label of each responsible role, for read-only rows and selects alike. */
export const getResponsibleRoleLabels = (): Record<
  ResponsibleRoleEnum,
  string
> => ({
  call_manager: translate('Call manager'),
  offering_manager: translate('Offering manager'),
  reviewer: translate('Reviewer'),
  panel_member: translate('Panel member'),
  panel_chair: translate('Panel chair or vice-chair'),
  applicant: translate('Applicant'),
  proposal_role: translate('Evaluator role'),
});

export const responsibleRoleLabel = (
  role: ResponsibleRoleEnum | string | null | undefined,
): string =>
  getResponsibleRoleLabels()[role as ResponsibleRoleEnum] ?? DASH_ESCAPE_CODE;

/** The label of each transition mode, for read-only rows and selects alike. */
export const getTransitionModeLabels = (): Record<
  TransitionModeEnum,
  string
> => ({
  automatic_on_completion: translate('Advance immediately on completion'),
  manual: translate('Hold for manual advance'),
});

export const transitionModeLabel = (
  mode: TransitionModeEnum | string | null | undefined,
): string =>
  getTransitionModeLabels()[mode as TransitionModeEnum] ?? DASH_ESCAPE_CODE;

export const AUTOMATIC_DECISION_GUARD_OPTIONS = [
  'earlier_step',
  'provider_fulfilment',
] as const;

// Mirrors AutomaticDecisionGuards.CHOICES in waldur-mastermind.
export const automaticDecisionGuardLabel = (
  guard: string | null | undefined,
): string => {
  switch (guard) {
    case 'earlier_step':
      return translate('An earlier step that can reject the proposal');
    case 'provider_fulfilment':
      return translate('The provider fulfilling each order');
    default:
      return DASH_ESCAPE_CODE;
  }
};

// Per-mode help text shown via the "?" icon next to each transition-mode
// radio. Mirrors the wording of TransitionModes.CHOICES in waldur-mastermind.
export const transitionModeDescription = (
  mode: TransitionModeEnum | string | null | undefined,
): string => {
  switch (mode) {
    case 'automatic_on_completion':
      return translate(
        'Advances to the next step as soon as a human completes this one. It does not auto-decide from scores — the minimum reviewers / score are completion gates a human still clears.',
      );
    case 'manual':
      return translate(
        'Waits for a separate manual advance after the step is completed.',
      );
    default:
      return '';
  }
};

export const RESPONSIBLE_ROLE_OPTIONS: ResponsibleRoleEnum[] = [
  'call_manager',
  'offering_manager',
  'reviewer',
  'panel_member',
  'panel_chair',
  'applicant',
  'proposal_role',
];

export const TRANSITION_MODE_OPTIONS: TransitionModeEnum[] = [
  'automatic_on_completion',
  'manual',
];
