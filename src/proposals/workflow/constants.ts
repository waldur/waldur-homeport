import {
  OutcomeEnum,
  ResponsibleRoleEnum,
  StepEnum,
  TransitionModeEnum,
} from 'waldur-js-client';

import { translate } from '@/i18n';

export type { ResponsibleRoleEnum, TransitionModeEnum };

interface StepDefinition {
  id: StepEnum;
  name: string;
  description: string;
  mandatory: boolean;
  dependencies: StepEnum[];
  // Catalog default for the responsible role. Mirrors
  // WorkflowStepDefinition.default_responsible_role in waldur-mastermind, which
  // the backend applies in CallWorkflowStep.save() when the role is omitted.
  // Used to render synthetic rows for mandatory steps that predate the
  // backfill migration (active/archived calls) identically to seeded ones.
  defaultResponsibleRole?: ResponsibleRoleEnum;
  // Outcomes the backend accepts when completing this step. Mirrors
  // WorkflowStepOutcomes.STEP_ALLOW_LIST in waldur-mastermind. 'rejected' and
  // 'expired' are intentionally omitted — they are reserved for system
  // transitions (rejection has its own endpoint, expiry is automatic).
  allowedOutcomes: OutcomeEnum[];
  // Provisioned by the backend via another step's toggle (e.g. award_response
  // is created/disabled by Allocation Decision's include_award_response flag).
  // Such rows must not expose direct add/remove/toggle actions — those would
  // drift from the toggle state on the next save.
  managedByToggle?: boolean;
}

// Returned via a function so that translate() runs at render time, after the
// async-loaded locale dictionary is in place.
export const getStepDefinitions = (): StepDefinition[] => [
  {
    id: 'administrative_check',
    name: translate('Administrative check'),
    description: translate(
      'Eligibility and completeness validation before evaluation.',
    ),
    mandatory: false,
    dependencies: [],
    allowedOutcomes: ['eligible', 'ineligible'],
    defaultResponsibleRole: 'call_manager',
  },
  {
    id: 'technical_assessment',
    name: translate('Technical assessment'),
    description: translate(
      'Service provider verifies technical feasibility of the proposal.',
    ),
    mandatory: false,
    dependencies: [],
    allowedOutcomes: ['feasible', 'infeasible'],
    defaultResponsibleRole: 'offering_manager',
  },
  {
    id: 'expert_review',
    name: translate('Expert review'),
    description: translate(
      'Independent peer review by domain experts with scoring.',
    ),
    mandatory: false,
    dependencies: [],
    allowedOutcomes: ['reviewed'],
    defaultResponsibleRole: 'reviewer',
  },
  {
    id: 'panel_review',
    name: translate('Panel review'),
    description: translate(
      'Collective panel evaluation consolidating expert reviews.',
    ),
    mandatory: false,
    dependencies: ['expert_review'],
    allowedOutcomes: ['approved', 'declined'],
    defaultResponsibleRole: 'panel_member',
  },
  {
    id: 'allocation_decision',
    name: translate('Allocation decision'),
    description: translate(
      'Final decision to approve or reject the proposal and allocate resources.',
    ),
    mandatory: true,
    dependencies: [],
    allowedOutcomes: ['approved', 'declined'],
    defaultResponsibleRole: 'call_manager',
  },
  {
    id: 'award_response',
    name: translate('Award response'),
    description: translate(
      'Applicant explicitly accepts or declines the award before provisioning.',
    ),
    mandatory: false,
    dependencies: [],
    allowedOutcomes: ['accepted', 'declined'],
    managedByToggle: true,
    defaultResponsibleRole: 'applicant',
  },
];

export const stepDefinition = (id: StepEnum): StepDefinition | undefined =>
  getStepDefinitions().find((d) => d.id === id);

export const stepLabel = (id: StepEnum): string =>
  stepDefinition(id)?.name ?? id;

// The set of currently-enabled step ids among `steps`. Dependency checks
// resolve against this: only an *enabled* dependency satisfies the backend
// rule — a configured-but-disabled one does not.
export const getEnabledStepIds = (
  steps: { step: StepEnum; is_enabled?: boolean | null }[],
): Set<StepEnum> =>
  new Set(steps.filter((s) => s.is_enabled).map((s) => s.step));

// Dependencies of `stepId` that are not in `enabledStepIds`. Mirrors
// CallWorkflowStep.clean() in waldur-mastermind, which rejects enabling a step
// until every dependency is enabled — so the UI must check enabled (not merely
// configured) steps before offering to enable a dependent.
export const getMissingDependencies = (
  stepId: StepEnum,
  enabledStepIds: Set<StepEnum>,
): StepEnum[] =>
  (stepDefinition(stepId)?.dependencies ?? []).filter(
    (dep) => !enabledStepIds.has(dep),
  );

// Steps that depend on `stepId`, directly or transitively. Disabling a step
// leaves these in a state the workflow can't run (their dependency is gone),
// so the toggle cascades the disable to them.
export const getDependentSteps = (stepId: StepEnum): StepEnum[] => {
  const defs = getStepDefinitions();
  const dependents = new Set<StepEnum>();
  const visit = (id: StepEnum) => {
    for (const def of defs) {
      if (def.dependencies.includes(id) && !dependents.has(def.id)) {
        dependents.add(def.id);
        visit(def.id);
      }
    }
  };
  visit(stepId);
  return [...dependents];
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
    case 'rejected':
      return translate('Rejected');
    case 'expired':
      return translate('Expired');
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
    default:
      return status;
  }
};

export const responsibleRoleLabel = (
  role: ResponsibleRoleEnum | string | null | undefined,
): string => {
  switch (role) {
    case 'call_manager':
      return translate('Call manager');
    case 'offering_manager':
      return translate('Offering manager');
    case 'reviewer':
      return translate('Reviewer');
    case 'panel_member':
      return translate('Panel member');
    case 'applicant':
      return translate('Applicant');
    default:
      return '—';
  }
};

export const transitionModeLabel = (
  mode: TransitionModeEnum | string | null | undefined,
): string => {
  switch (mode) {
    case 'automatic_on_completion':
      return translate('Automatic on completion');
    case 'manual':
      return translate('Manual (call manager)');
    default:
      return '—';
  }
};

// Per-mode help text shown via the "?" icon next to each transition-mode
// radio. Mirrors the wording of TransitionModes.CHOICES in waldur-mastermind.
export const transitionModeDescription = (
  mode: TransitionModeEnum | string | null | undefined,
): string => {
  switch (mode) {
    case 'automatic_on_completion':
      return translate('Advance automatically when the step completes.');
    case 'manual':
      return translate(
        'Advance manually — a call manager confirms the transition.',
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
  'applicant',
];

export const TRANSITION_MODE_OPTIONS: TransitionModeEnum[] = [
  'automatic_on_completion',
  'manual',
];

// Reused by every call-config section to explain why edit/add/delete actions
// are disabled once the call is no longer in draft.
export const callLockedTooltip = () =>
  translate('Call configuration cannot be changed once the call is activated.');
