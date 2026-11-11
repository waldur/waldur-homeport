import {
  StepStatusLabels,
  WorkflowDescription,
  WorkflowDescriptionStep,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { outcomeLabel } from '@/proposals/workflow/constants';
import { applicantLabelsApply } from '@/proposals/workflow/statusLabels';

/**
 * What a step does, in the words of one sentence. The step list, the template
 * previews and the step dialog's Check page all build their sentence from
 * this shape through `formatStepSummary`, so a step reads the same wherever
 * it is shown. `fromDescription` fills it from the backend's workflow
 * description; `fromStepForm` from a step dialog's unsaved values.
 */
export interface SummaryStep {
  name: string;
  enabled: boolean;
  kind: string | null;
  completer: string | null;
  completerRoleName?: string | null;
  completionLeadOnly: boolean;
  contributorSource: string | null;
  contributorParameter?: string | null;
  contributorRoleName?: string | null;
  contributorsLeadOnly: boolean;
  perRequestedOffering: boolean;
  minContributions: number | null;
  isAllocationDecision: boolean;
  decidesAutomatically: boolean;
  /** The automatic decision needs no rejecting step before it: someone at
   * the provider acts on every order the award places. */
  reliesOnProviderFulfilment?: boolean;
  assignsRoleNames: string[];
  inputStepNames: string[];
  runCondition?: {
    stepName: string;
    outcomes: string[];
    /** Runs on how far apart that step's scores lie, not on its outcome. */
    scoreSpreadAbove?: number | null;
  } | null;
  stageMateNames: string[];
  applicantVisible: boolean;
  applicantLabel: string;
  releaseToApplicant: boolean;
  blindReview: boolean;
  allowsChangeRequests: boolean;
  delegation?: { target: string; roleName?: string | null } | null;
  durationInDays: number | null;
  /** Who is mailed when the step starts, as actor labels. */
  startNotifies: string[];
}

export type ApplicantLabelKind =
  | 'configured'
  | 'step_name'
  | 'awaiting_response'
  | 'decision'
  | 'internal_check';

/**
 * What the applicant's tracker calls a step while it is current: the label
 * the call configured for it, where the applicant's labels reach them;
 * else its own name when the call shows it to them, otherwise the stand-in
 * for its stage. The backend's description derives the same; a shared
 * fixture pins both.
 */
export const applicantLabelKind = (step: {
  applicant_visible?: boolean | null;
  kind?: string | null;
  outcome_set?: string | null;
  is_allocation_decision?: boolean | null;
  status_labels?: StepStatusLabels | null;
}): ApplicantLabelKind => {
  if (
    applicantLabelsApply(step) &&
    step.status_labels?.applicant?.active?.trim()
  ) {
    return 'configured';
  }
  if (step.applicant_visible) return 'step_name';
  if (step.kind === 'applicant_action' && step.outcome_set === 'acceptance') {
    return 'awaiting_response';
  }
  if (step.is_allocation_decision) return 'decision';
  return 'internal_check';
};

export const applicantLabelText = (
  kind: ApplicantLabelKind | string,
  stepName: string,
  configured?: string | null,
): string => {
  switch (kind) {
    case 'configured':
      return configured?.trim() || stepName;
    case 'awaiting_response':
      return translate('Awaiting your response');
    case 'decision':
      return translate('Decision');
    case 'internal_check':
      return translate('Internal check');
    default:
      return stepName;
  }
};

/** An actor of the description, by its kind, for a sentence. */
export const actorLabel = (kind: string, roleName?: string | null): string => {
  switch (kind) {
    case 'applicant':
      return translate('the applicant');
    case 'call_manager':
      return translate('call managers');
    case 'panel_chair':
      return translate('the panel chair or vice-chair');
    case 'panel_member':
      return translate('panel members');
    case 'reviewer':
      return translate('assigned reviewers');
    case 'offering_team':
      return translate('the offering team');
    case 'proposal_role':
      return roleName || translate('evaluator role holders');
    case 'proposal_role_lead':
      return translate('the lead {role}', { role: roleName || '' });
    case 'system':
      return translate('the system');
    default:
      return kind;
  }
};

/** An actor's column title. */
export const actorTitle = (actor: { kind: string; label: string }): string => {
  switch (actor.kind) {
    case 'applicant':
      return translate('Applicant');
    case 'call_manager':
      return translate('Call manager');
    case 'panel_chair':
      return translate('Panel chair / vice-chair');
    case 'panel_member':
      return translate('Panel member');
    case 'reviewer':
      return translate('Assigned reviewer');
    case 'offering_team':
      return translate('Offering team');
    case 'system':
      return translate('System');
    case 'proposal_role_lead':
      return translate('Lead {role}', {
        role: actor.label.replace(/^Lead /, ''),
      });
    default:
      return actor.label;
  }
};

const COMPLETER_ACTOR: Record<string, string> = {
  applicant: 'applicant',
  call_manager: 'call_manager',
  offering_manager: 'offering_team',
  reviewer: 'reviewer',
  panel_member: 'panel_member',
  panel_chair: 'panel_chair',
};

const CALL_ROLE_ACTOR: Record<string, string> = {
  call_manager: 'call_manager',
  reviewer: 'reviewer',
  panel_member: 'panel_member',
  panel_chair: 'panel_chair',
};

const completerText = (step: SummaryStep): string | null => {
  if (step.completer === 'proposal_role') {
    return actorLabel(
      step.completionLeadOnly ? 'proposal_role_lead' : 'proposal_role',
      step.completerRoleName,
    );
  }
  const actor = step.completer ? COMPLETER_ACTOR[step.completer] : undefined;
  return actor ? actorLabel(actor) : null;
};

const contributorsText = (step: SummaryStep): string | null => {
  switch (step.contributorSource) {
    case 'requested_offering_team':
      return actorLabel('offering_team');
    case 'assigned_reviewers':
      return actorLabel('reviewer');
    case 'proposal_role':
      return actorLabel(
        step.contributorsLeadOnly ? 'proposal_role_lead' : 'proposal_role',
        step.contributorRoleName,
      );
    case 'call_role': {
      const actor = CALL_ROLE_ACTOR[step.contributorParameter ?? ''];
      return actor ? actorLabel(actor) : null;
    }
    default:
      return null;
  }
};

const list = (items: string[]) => items.filter(Boolean).join(', ');

/** The parts of a step's sentence, in reading order. */
const stepSummaryParts = (step: SummaryStep): string[] => {
  const parts: string[] = [];
  const completer = completerText(step);
  const contributors = contributorsText(step);
  if (step.decidesAutomatically) {
    parts.push(
      completer
        ? translate(
            'decided automatically by the system, falling back to {who} when the approval is refused',
            { who: completer },
          )
        : translate('decided automatically by the system'),
    );
    if (step.reliesOnProviderFulfilment) {
      parts.push(translate('relying on the provider fulfilling each order'));
    }
  } else if (completer && contributors) {
    parts.push(
      step.perRequestedOffering
        ? translate(
            'completed by {who} after {contributors} contribute, one contribution per requested offering',
            { who: completer, contributors },
          )
        : step.minContributions
          ? translate(
              'completed by {who} after {count} of {contributors} contribute',
              { who: completer, count: step.minContributions, contributors },
            )
          : translate('completed by {who} after {contributors} contribute', {
              who: completer,
              contributors,
            }),
    );
  } else if (completer) {
    parts.push(translate('completed by {who}', { who: completer }));
  }
  if (step.assignsRoleNames.length) {
    parts.push(
      translate('assigns {roles}', { roles: list(step.assignsRoleNames) }),
    );
  }
  if (step.inputStepNames.length) {
    parts.push(
      translate('reads {steps}', { steps: list(step.inputStepNames) }),
    );
  }
  if (step.runCondition?.stepName) {
    parts.push(
      translate('runs only if {condition}', {
        condition: conditionText(step.runCondition),
      }),
    );
  }
  if (step.stageMateNames.length) {
    parts.push(
      translate('runs alongside {steps}', {
        steps: list(step.stageMateNames),
      }),
    );
  }
  if (step.blindReview) {
    parts.push(translate("contributors do not see each other's work"));
  }
  if (step.delegation?.target === 'offering_team') {
    parts.push(translate("slots can be handed on within the offering's team"));
  } else if (step.delegation?.target === 'proposal_role') {
    parts.push(
      translate('slots can be handed to {role}', {
        role: step.delegation.roleName || translate('an evaluator role'),
      }),
    );
  }
  if (step.allowsChangeRequests) {
    parts.push(translate('may send the proposal back to the applicant'));
  }
  if (step.applicantVisible) {
    parts.push(translate('visible to applicants'));
  } else {
    parts.push(
      translate("hidden from applicants (they see '{label}')", {
        label: step.applicantLabel,
      }),
    );
  }
  if (step.releaseToApplicant) {
    parts.push(translate('its report can be released to the applicant'));
  }
  if (step.durationInDays) {
    parts.push(
      translate('due {days} days after it starts', {
        days: step.durationInDays,
      }),
    );
  }
  if (step.startNotifies.length) {
    parts.push(
      translate('emails {who} when it starts', {
        who: list(step.startNotifies),
      }),
    );
  }
  return parts;
};

/** The sentence: the step's name, then what it does. */
/**
 * A run condition in a few words: the earlier step and the outcomes it runs
 * on, or how far apart that step's scores must lie.
 */
export const conditionText = (condition: {
  stepName: string;
  outcomes?: string[] | null;
  scoreSpreadAbove?: number | null;
}): string =>
  condition.scoreSpreadAbove !== null &&
  condition.scoreSpreadAbove !== undefined
    ? translate('{step} scores differ by more than {points}', {
        step: condition.stepName,
        points: condition.scoreSpreadAbove,
      })
    : `${condition.stepName} = ${(condition.outcomes ?? [])
        .map(outcomeLabel)
        .join(' / ')}`;

export const formatStepSummary = (step: SummaryStep): string => {
  const parts = stepSummaryParts(step);
  const body = parts.join('; ');
  const sentence = body
    ? translate('{name}: {summary}.', { name: step.name, summary: body })
    : step.name;
  return step.enabled
    ? sentence
    : translate('{sentence} Disabled: proposals skip it.', { sentence });
};

const roleName = (description: WorkflowDescription, key?: string | null) =>
  description.actors.find(
    (actor) => actor.kind === 'proposal_role' && actor.role_key === key,
  )?.label ?? key;

/** The description's actors by key, for labels. */
const actorLabels = (description: WorkflowDescription) =>
  new Map(
    description.actors.map((actor) => [
      actor.key,
      actorLabel(
        actor.kind,
        actor.role_key ? roleName(description, actor.role_key) : null,
      ),
    ]),
  );

/** A described step in the summary's shape. */
export const fromDescription = (
  step: WorkflowDescriptionStep,
  description: WorkflowDescription,
): SummaryStep => {
  const names = new Map(description.steps.map((s) => [s.key, s.name]));
  const labels = actorLabels(description);
  const startNotifies = Array.from(
    new Set(
      step.notifications
        .filter((rule) => rule.enabled && rule.trigger === 'step_started')
        .flatMap((rule) => rule.actors)
        .map((actor) => labels.get(actor) ?? actor),
    ),
  );
  return {
    name: step.name,
    enabled: step.enabled,
    kind: step.kind,
    completer: step.completer,
    completerRoleName: roleName(description, step.completer_proposal_role),
    completionLeadOnly: step.completion_lead_only,
    contributorSource: step.contributors.source,
    contributorParameter: step.contributors.parameter,
    contributorRoleName:
      step.contributors.source === 'proposal_role'
        ? roleName(description, step.contributors.parameter)
        : null,
    contributorsLeadOnly: step.contributors.lead_only,
    perRequestedOffering: step.contributors.per_requested_offering,
    minContributions: step.contributors.min,
    isAllocationDecision: step.is_allocation_decision,
    decidesAutomatically: step.decides_automatically,
    reliesOnProviderFulfilment:
      step.decides_automatically &&
      step.automatic_decision_guard === 'provider_fulfilment',
    assignsRoleNames: step.assigns_roles.map(
      (key) => roleName(description, key) ?? key,
    ),
    inputStepNames: step.input_steps.map((key) => names.get(key) ?? key),
    runCondition: step.run_condition
      ? {
          stepName:
            names.get(step.run_condition.step) ?? step.run_condition.step,
          outcomes: step.run_condition.outcomes,
          scoreSpreadAbove: step.run_condition.score_spread_above,
        }
      : null,
    stageMateNames: description.steps
      .filter(
        (other) =>
          other.key !== step.key && other.stage === step.stage && other.enabled,
      )
      .map((other) => other.name),
    applicantVisible: step.applicant.visible,
    applicantLabel: applicantLabelText(
      step.applicant.label_kind,
      step.name,
      step.applicant.label,
    ),
    releaseToApplicant: step.release_to_applicant,
    blindReview: step.blind_review,
    allowsChangeRequests: step.allows_change_requests,
    delegation: step.delegable_to
      ? {
          target: step.delegable_to.target,
          roleName: roleName(description, step.delegable_to.proposal_role),
        }
      : null,
    durationInDays: step.duration_in_days,
    startNotifies,
  };
};
