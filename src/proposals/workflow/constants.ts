import {
  CallStepKindEnum,
  CallWorkflowStep,
  OnNegativeEnum,
  OutcomeEnum,
  ResponsibleRoleEnum,
  StepKind,
  TransitionModeEnum,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';

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

/** What one contribution to a per-offering assessment concluded. */
export const contributionOutcomeLabel = (outcome: string): string => {
  switch (outcome) {
    case 'accepted':
      return translate('Accepted');
    case 'conditionally_accepted':
      return translate('Conditionally accepted');
    case 'rejected':
      return translate('Rejected');
    default:
      return outcomeLabel(outcome);
  }
};

export const contributionOutcomeVariant = (
  outcome: string | null | undefined,
): 'success' | 'warning' | 'danger' | 'neutral' => {
  switch (outcome) {
    case 'accepted':
    case 'feasible':
    case 'eligible':
    case 'approved':
      return 'success';
    case 'conditionally_accepted':
      return 'warning';
    case 'rejected':
    case 'infeasible':
    case 'ineligible':
    case 'declined':
      return 'danger';
    default:
      return 'neutral';
  }
};

/**
 * A contribution's status. "expired" on a step still running means the
 * contributor lost standing (the role went, or a conflict of interest was
 * recorded) and the slot comes back if they regain it: it is paused, not over.
 */
export const contributionStatusLabel = (
  status: string,
  stepActive = false,
): string => {
  if (status === 'expired' && stepActive) {
    return translate('Paused');
  }
  switch (status) {
    case 'pending':
      return translate('Pending');
    case 'accepted':
      return translate('In progress');
    case 'submitted':
      return translate('Submitted');
    case 'declined':
      return translate('Declined');
    case 'withdrawn':
      return translate('Withdrawn');
    case 'expired':
      return translate('Expired');
    default:
      return status;
  }
};

/** Why a contribution stopped, for a tooltip on its status; empty otherwise. */
export const contributionStatusHint = (
  status: string,
  stepActive = false,
): string => {
  switch (status) {
    case 'expired':
      return stepActive
        ? translate(
            'Paused: the contributor no longer holds the role or has a conflict of interest.',
          )
        : translate('The step ended before this contribution was submitted.');
    case 'withdrawn':
      return translate(
        'Withdrawn by a call manager, or closed when the step was decided or the contributor joined the applicant team.',
      );
    default:
      return '';
  }
};

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

export const outcomeLabel = (outcome: OutcomeEnum | string): string => {
  switch (outcome) {
    case 'eligible':
      return translate('Eligible');
    case 'ineligible':
      return translate('Ineligible');
    case 'feasible':
      return translate('Feasible');
    case 'infeasible':
      return translate('Infeasible');
    case 'reviewed':
      return translate('Reviewed');
    case 'approved':
      return translate('Approved');
    case 'declined':
      return translate('Declined');
    case 'accepted':
      return translate('Accepted');
    case 'submitted':
      return translate('Submitted');
    case 'done':
      return translate('Done');
    case 'rejected':
      return translate('Rejected');
    case 'expired':
      return translate('Expired');
    case 'no_response':
      return translate('No response');
    case 'conditionally_accepted':
      return translate('Conditionally accepted');
    default:
      return outcome;
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
