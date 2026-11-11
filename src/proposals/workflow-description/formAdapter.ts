import {
  CallProposalRole,
  CallWorkflowStep,
  StepKind,
  WorkflowDescription,
} from 'waldur-js-client';

import {
  runConditionBody,
  StepFormValues,
} from '@/proposals/update/workflow-steps/stepForm';
import { stepName } from '@/proposals/workflow/constants';

import {
  applicantLabelKind,
  applicantLabelText,
  fromDescription,
  SummaryStep,
} from './summary';

interface FormContext {
  kind: StepKind | undefined;
  roles: CallProposalRole[] | undefined;
  /** The call's steps as saved, to name inputs and neighbours. */
  steps: CallWorkflowStep[] | undefined;
  /** The step being edited, as saved; absent while it is being added. */
  step?: CallWorkflowStep;
  /** The saved call's description, for what the dialog does not edit. */
  description?: WorkflowDescription;
}

const roleRef = (value: string | null | undefined) =>
  (value ?? '').replace(/^proposal_role:/, '').replace(/-/g, '');

const findRole = (roles: CallProposalRole[] | undefined, ref: string) =>
  (roles ?? []).find(
    (role) => role.uuid.replace(/-/g, '') === ref || role.key === ref,
  );

/**
 * A step dialog's unsaved values in the summary's shape, so the Check page
 * reads them with the same sentence as the step list.
 */
export const fromStepForm = (
  values: StepFormValues,
  { kind, roles, steps, step, description }: FormContext,
): SummaryStep => {
  const name = values.name || stepName(step ?? {}) || kind?.name || '';
  const source = values.contributor_source || 'none';
  const [sourceKind, sourceParameter] = source.includes(':')
    ? [
        source.slice(0, source.indexOf(':')),
        source.slice(source.indexOf(':') + 1),
      ]
    : [source, null];
  const contributingRole =
    sourceKind === 'proposal_role'
      ? (findRole(roles, roleRef(sourceParameter)) ??
        (step?.contributor_proposal_role_uuid
          ? findRole(roles, roleRef(step.contributor_proposal_role_uuid))
          : undefined))
      : undefined;
  const completingRole =
    values.completer === 'proposal_role'
      ? findRole(roles, roleRef(values.completer_proposal_role))
      : undefined;
  const others = (steps ?? []).filter((other) => other.uuid !== step?.uuid);
  const byUuid = new Map(others.map((other) => [other.uuid, other]));
  const byKey = new Map(others.map((other) => [other.key, other]));
  const ordered = [...others].sort((a, b) => a.order - b.order);
  const previous = step
    ? [...ordered].reverse().find((other) => other.order < step.order)
    : ordered[ordered.length - 1];
  const next = step ? ordered.find((other) => other.order > step.order) : null;
  const stageMateNames = [
    ...(values.parallel_with_previous && previous ? [stepName(previous)] : []),
    ...(next?.parallel_with_previous ? [stepName(next)] : []),
  ];
  const delegation = values.delegable_to || '';
  const delegationRole = delegation.startsWith('proposal_role:')
    ? findRole(roles, roleRef(delegation))
    : undefined;
  const isAllocationDecision = !!values.is_allocation_decision;
  const described =
    step && description
      ? description.steps.find((candidate) => candidate.key === step.key)
      : undefined;
  const conditionStep = values.run_condition_step
    ? byKey.get(values.run_condition_step)
    : undefined;
  return {
    name,
    enabled: values.is_enabled !== false,
    kind: kind?.id ?? null,
    completer: values.completer,
    completerRoleName: completingRole?.name,
    completionLeadOnly:
      !!values.contributors_lead_only &&
      values.completer === 'proposal_role' &&
      !!completingRole &&
      completingRole.uuid === contributingRole?.uuid,
    contributorSource: sourceKind,
    contributorParameter: sourceParameter,
    contributorRoleName: contributingRole?.name,
    contributorsLeadOnly:
      !!values.contributors_lead_only && sourceKind === 'proposal_role',
    perRequestedOffering: !!values.per_requested_offering,
    minContributions: values.min_contributions ?? null,
    isAllocationDecision,
    decidesAutomatically:
      isAllocationDecision && !!values.decides_automatically,
    reliesOnProviderFulfilment:
      isAllocationDecision &&
      !!values.decides_automatically &&
      values.automatic_decision_guard === 'provider_fulfilment',
    assignsRoleNames: (values.assigns_roles ?? []).map(
      (ref) => findRole(roles, roleRef(ref))?.name ?? ref,
    ),
    inputStepNames: (values.input_steps ?? []).map((uuid) =>
      byUuid.get(uuid) ? stepName(byUuid.get(uuid)!) : uuid,
    ),
    runCondition: runConditionBody(values)
      ? {
          stepName: conditionStep
            ? stepName(conditionStep)
            : (values.run_condition_step ?? ''),
          outcomes: values.run_condition_outcomes,
          scoreSpreadAbove:
            values.run_condition_kind === 'score_spread'
              ? Number(values.run_condition_score_spread)
              : null,
        }
      : null,
    stageMateNames,
    applicantVisible: !!values.applicant_visible,
    applicantLabel: applicantLabelText(
      applicantLabelKind({
        applicant_visible: values.applicant_visible,
        kind: kind?.id,
        outcome_set: values.outcome_set,
        is_allocation_decision: isAllocationDecision,
        status_labels: values.status_labels,
      }),
      name,
      values.status_labels?.applicant?.active,
    ),
    releaseToApplicant: !!values.release_to_applicant,
    blindReview: !!values.blind_review,
    allowsChangeRequests:
      !!values.allows_change_requests && !isAllocationDecision,
    delegation: delegation
      ? {
          target: delegation.startsWith('proposal_role:')
            ? 'proposal_role'
            : delegation,
          roleName: delegationRole?.name,
        }
      : null,
    durationInDays: values.duration_in_days || null,
    // Notification rules are not edited here: the saved ones apply.
    startNotifies:
      described && description
        ? fromDescription(described, description).startNotifies
        : [],
  };
};
