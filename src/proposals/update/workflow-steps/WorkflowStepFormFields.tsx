import { useQuery } from '@tanstack/react-query';
import { FC, ReactNode, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-final-form';
import {
  CallWorkflowStep,
  proposalProtectedCallsStepChecklistsList,
  StepKind,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { required } from '@/core/validators';
import {
  BooleanGroup,
  FormGroup,
  NumberGroup,
  RadioGroup,
  SelectGroup,
  StringGroup,
  TextGroup,
} from '@/form';
import { translate } from '@/i18n';
import { getAllocationTimeOptions } from '@/proposals/utils';
import {
  CONTRIBUTOR_SOURCE_OPTIONS,
  contributorSourceLabel,
  kindHasField,
  ON_NEGATIVE_OPTIONS,
  onNegativeLabel,
  outcomeLabel,
  RESPONSIBLE_ROLE_OPTIONS,
  responsibleRoleLabel,
  TRANSITION_MODE_OPTIONS,
  transitionModeDescription,
  transitionModeLabel,
} from '@/proposals/workflow/constants';
import {
  callWorkflowStepsKey,
  fetchCallWorkflowSteps,
} from '@/proposals/workflow/queries';

import { useCallProposalRoles } from '../../proposal-roles/queries';

import { CriteriaListField } from './CriteriaListField';
import { StatusLabelsFields } from './StatusLabelsFields';
import {
  contributorRole,
  StepFormPage,
  StepFormValues,
  stepFieldShown,
} from './stepForm';

/**
 * When the kind picked in the Add dialog changes, start the step from that
 * kind's defaults: its first outcome set and its usual completer. Applied
 * whenever the values do not fit the kind, so it holds however often the
 * effect runs.
 */
export const ApplyKindDefaults: FC<{
  kind: StepKind | undefined;
  values: StepFormValues;
}> = ({ kind, values }) => {
  const form = useForm<StepFormValues>();
  const appliedKind = useRef<string | undefined>(undefined);
  const outcomeSetFits = Boolean(
    kind?.outcome_sets.some((set) => set.id === values.outcome_set),
  );
  useEffect(() => {
    if (!kind) return;
    const kindChanged = appliedKind.current !== kind.id;
    appliedKind.current = kind.id;
    form.batch(() => {
      if (!outcomeSetFits) {
        form.change('outcome_set', kind.default_outcome_set as any);
      }
      if (kindChanged || !values.completer) {
        form.change('completer', kind.default_completer as any);
      }
      if (!kindHasField(kind, 'is_allocation_decision')) {
        form.change('is_allocation_decision', false);
      }
    });
  }, [kind, form, outcomeSetFits, values.completer]);
  return null;
};

/**
 * A step split per requested offering is its offerings' teams' work: keep the
 * contributor source on the offering team while the split is on.
 */
const SyncPerOfferingSource: FC<{ values: StepFormValues }> = ({ values }) => {
  const form = useForm<StepFormValues>();
  useEffect(() => {
    if (
      values.per_requested_offering &&
      values.contributor_source !== 'requested_offering_team'
    ) {
      form.change('contributor_source', 'requested_offering_team');
    }
  }, [form, values.per_requested_offering, values.contributor_source]);
  return null;
};

interface WorkflowStepFormFieldsProps {
  kind: StepKind | undefined;
  values: StepFormValues;
  /** The call whose evaluator roles a step may assign or be completed by. */
  callUuid: string;
  /**
   * The organisation running the call: a step takes the forms the whole
   * portal shares and that organisation's own, never another's.
   */
  customerUuid?: string;
  /** Whether the step is enabled is a switch of its own, shown on edit. */
  showEnableSwitch?: boolean;
  /**
   * Why the allocation decision cannot move to or from this step, when the
   * call already says so; the flag is then shown but not editable.
   */
  allocationDecisionLockedReason?: string;
  /** The step being configured; a new step goes after every other. */
  step?: CallWorkflowStep;
  /** Whether the call keeps review comments and scores from applicants. */
  reviewsHiddenFromApplicants?: boolean;
  /** The pages the step has, and the one shown. */
  pages: StepFormPage[];
  page: StepFormPage;
  /** The Add dialog's kind select, first on the first page. */
  kindField?: ReactNode;
}

/**
 * The steps a step may read the outputs of: the call's steps before it.
 */
/**
 * The steps a step's run condition may name: those before it. Named by key,
 * as the condition is.
 */
const conditionStepOptions = (
  steps: CallWorkflowStep[] | undefined,
  step?: CallWorkflowStep,
) =>
  (steps ?? [])
    .filter(
      (candidate) =>
        candidate.uuid !== step?.uuid &&
        !candidate.is_allocation_decision &&
        (step === undefined || candidate.order < step.order),
    )
    .sort((a, b) => a.order - b.order)
    .map((candidate) => ({ value: candidate.key, label: candidate.name }));

const requiredOutcomes = (value: string[] | undefined) =>
  value?.length ? undefined : translate('Pick at least one outcome.');

const requiredSpread = (value: number | string | null | undefined) =>
  value === null || value === undefined || value === '' || Number(value) < 0
    ? translate('Enter the number of points, 0 or more.')
    : undefined;

const RUN_CONDITION_KIND_CHOICES = () => [
  { value: 'outcomes', label: translate('Its outcome') },
  { value: 'score_spread', label: translate('How far apart its scores lie') },
];

// What a contribution to a per-offering step concludes, besides the step's
// own outcomes.
const PER_OFFERING_OUTCOMES = [
  'accepted',
  'conditionally_accepted',
  'rejected',
];

/**
 * The outcomes a run condition may name on `source`: its own, its
 * contributions', and its lapse.
 */
const conditionOutcomeOptions = (source: CallWorkflowStep | undefined) => {
  if (!source) return [];
  const outcomes = [
    ...(source.allowed_outcomes ?? []),
    ...(source.outcome_set === 'per_offering'
      ? PER_OFFERING_OUTCOMES.filter(
          (outcome) =>
            outcome !== 'conditionally_accepted' ||
            source.allows_conditional_acceptance !== false,
        )
      : []),
    'expired',
  ];
  return [...new Set(outcomes)].map((value) => ({
    value,
    label: outcomeLabel(value),
  }));
};

const inputStepOptions = (
  steps: CallWorkflowStep[] | undefined,
  step?: CallWorkflowStep,
) =>
  (steps ?? [])
    .filter(
      (candidate) =>
        candidate.uuid !== step?.uuid &&
        (step === undefined || candidate.order < step.order),
    )
    .sort((a, b) => a.order - b.order)
    .map((candidate) => ({ value: candidate.uuid, label: candidate.name }));

/**
 * Whether a step's output is review content, which the call's setting on
 * showing reviews to applicants governs: a step collecting reviews, or an
 * approval decision other than the allocation decision.
 */
const isReviewStep = (step: CallWorkflowStep) =>
  step.outcome_set === 'reviewed' ||
  (step.kind === 'decision' &&
    step.outcome_set === 'approval' &&
    !step.is_allocation_decision);

/**
 * The fields of a call step, limited to those its kind is configured with
 * (the kinds endpoint's `config_fields`): review settings and criteria on an
 * assessment, the allocation decision flag on a decision, and allocation
 * timing only once the step is the allocation decision. They are laid out on
 * pages, one shown at a time.
 */
export const WorkflowStepFormFields: FC<WorkflowStepFormFieldsProps> = ({
  kind,
  values,
  callUuid,
  customerUuid,
  showEnableSwitch,
  allocationDecisionLockedReason,
  step,
  reviewsHiddenFromApplicants,
  pages,
  page,
  kindField,
}) => {
  const has = (field: string) => kindHasField(kind, field);
  const show = (field: keyof StepFormValues) =>
    stepFieldShown(field, kind, values, { showEnableSwitch });
  const completedByRole = values.completer === 'proposal_role';
  const contributedByRole = (values.contributor_source ?? '').startsWith(
    'proposal_role:',
  );

  // The call's evaluator roles: what an assignment step assigns, whose
  // holders complete a step, or whose holders contribute to it.
  const delegationShown = show('delegable_to');
  const { data: proposalRoles } = useCallProposalRoles(
    callUuid,
    has('assigns_roles') ||
      completedByRole ||
      contributedByRole ||
      delegationShown,
  );
  // Only a role with a lead can leave the step to its lead alone.
  const leadOnlyAvailable = Boolean(
    has('contributors_lead_only') &&
    contributorRole(
      values.contributor_source,
      proposalRoles,
      step?.contributor_proposal_role_uuid,
    )?.allows_lead,
  );

  const proposalRoleOptions = useMemo(
    () =>
      (proposalRoles ?? []).map((role) => ({
        value: role.uuid,
        label: role.name,
      })),
    [proposalRoles],
  );

  // Per-offering slots go to the offering's team; a person's slot to the
  // holders of another evaluator role.
  const contributingRoleUuid = contributorRole(
    values.contributor_source,
    proposalRoles,
    step?.contributor_proposal_role_uuid,
  )?.uuid;
  const delegationOptions = useMemo(
    () => [
      { value: '', label: translate('Nobody') },
      ...(values.per_requested_offering
        ? [
            {
              value: 'offering_team',
              label: translate("Anyone with a role on the slot's offering"),
            },
          ]
        : (proposalRoles ?? [])
            .filter((role) => role.uuid !== contributingRoleUuid)
            .map((role) => ({
              value: `proposal_role:${role.uuid}`,
              label: translate('Holders of {role}', { role: role.name }),
            }))),
    ],
    [values.per_requested_offering, proposalRoles, contributingRoleUuid],
  );

  const outcomeSetOptions = useMemo(
    () =>
      (kind?.outcome_sets ?? []).map((set) => ({
        value: set.id,
        label: set.name,
      })),
    [kind],
  );

  // The applicant completes only an applicant action: on any other step
  // they would assess or decide on their own proposal.
  const responsibleRoleOptions = useMemo(
    () =>
      RESPONSIBLE_ROLE_OPTIONS.filter(
        (value) => value !== 'applicant' || kind?.id === 'applicant_action',
      ).map((value) => ({
        value,
        label: responsibleRoleLabel(value),
      })),
    [kind],
  );

  const phaseOptions = useMemo(
    () => [
      { value: 'evaluation', label: translate('In the evaluation') },
      { value: 'extension', label: translate('In an extension request') },
      { value: 'closing', label: translate('In the closing (final report)') },
    ],
    [],
  );

  const transitionModeChoices = useMemo(
    () =>
      TRANSITION_MODE_OPTIONS.map((value) => ({
        value,
        label: transitionModeLabel(value),
        tooltip: transitionModeDescription(value),
      })),
    [],
  );

  const contributorSourceOptions = useMemo(() => {
    const options = CONTRIBUTOR_SOURCE_OPTIONS.map((value) => ({
      value,
      label: contributorSourceLabel(value),
    }));
    // A source set elsewhere (an evaluator role) is kept selectable.
    if (
      values.contributor_source &&
      !options.some((option) => option.value === values.contributor_source)
    ) {
      options.push({
        value: values.contributor_source as any,
        label: contributorSourceLabel(values.contributor_source),
      });
    }
    return options;
  }, [values.contributor_source]);

  const onNegativeChoices = useMemo(
    () =>
      ON_NEGATIVE_OPTIONS.map((value) => ({
        value,
        label: onNegativeLabel(value),
      })),
    [],
  );

  // The call-manager-accessible catalogue (workflow-step checklists only),
  // not the staff-only checklist admin API, which refuses call managers.
  // Limited to the forms the call's organisation may use.
  const { data: checklists } = useQuery({
    queryKey: ['workflowStepChecklists', customerUuid],
    queryFn: () =>
      proposalProtectedCallsStepChecklistsList(
        customerUuid ? { query: { customer_uuid: customerUuid } } : undefined,
      ).then((response) => response.data ?? []),
    refetchOnWindowFocus: false,
    enabled: has('checklist'),
  });

  // The call's other steps, the ones before this step being its possible
  // inputs.
  const { data: callSteps } = useQuery({
    queryKey: callWorkflowStepsKey(callUuid),
    queryFn: () => fetchCallWorkflowSteps(callUuid),
    refetchOnWindowFocus: false,
    enabled: has('input_steps') || has('run_condition'),
  });
  const inputOptions = useMemo(
    () => inputStepOptions(callSteps, step),
    [callSteps, step],
  );
  const conditionStepChoices = useMemo(
    () => conditionStepOptions(callSteps, step),
    [callSteps, step],
  );
  const conditionOutcomeChoices = useMemo(
    () =>
      conditionOutcomeOptions(
        (callSteps ?? []).find(
          (candidate) => candidate.key === values.run_condition_step,
        ),
      ),
    [callSteps, values.run_condition_step],
  );
  // An applicant step reads its inputs whatever the call says about showing
  // reviews to applicants, so say so when it takes reviews the call hides.
  const showsHiddenReviews =
    reviewsHiddenFromApplicants &&
    kind?.id === 'applicant_action' &&
    (callSteps ?? []).some(
      (candidate) =>
        (values.input_steps ?? []).includes(candidate.uuid) &&
        isReviewStep(candidate),
    );

  const checklistOptions = useMemo(
    () =>
      (checklists ?? []).map((c) => ({
        value: c.uuid,
        label: c.name,
      })),
    [checklists],
  );

  if (!kind) {
    return kindField ? <>{kindField}</> : null;
  }

  // The Check page is the dialog's own, not a page of fields.
  const sections: Record<Exclude<StepFormPage, 'check'>, ReactNode> = {
    basics: (
      <>
        {kindField}

        {show('name') && (
          <StringGroup
            name="name"
            label={translate('Name')}
            required={true}
            validate={required}
            maxLength={255}
          />
        )}

        {show('description') && (
          <TextGroup
            name="description"
            label={translate('Description')}
            rows={2}
          />
        )}

        {show('is_enabled') && (
          <BooleanGroup
            name="is_enabled"
            label={translate('Step enabled')}
            description={translate(
              'When off, the step is skipped: it stays out of the workflow preview and no proposal ever enters it.',
            )}
          />
        )}

        {show('phase') && (
          <SelectGroup
            name="phase"
            label={translate('Runs')}
            description={translate(
              'In the evaluation, from submission to the award. In an extension, which the team of an accepted proposal asks for as often as needed. In the closing, for the final report at the end of the allocation.',
            )}
            options={phaseOptions}
            simpleValue={true}
            isClearable={false}
          />
        )}

        {show('is_allocation_decision') && (
          <BooleanGroup
            name="is_allocation_decision"
            label={translate('Allocation decision')}
            disabled={Boolean(allocationDecisionLockedReason)}
            description={
              allocationDecisionLockedReason ||
              translate(
                'The decision that settles the award. A call runs exactly one.',
              )
            }
          />
        )}

        {show('decides_automatically') && (
          <BooleanGroup
            name="decides_automatically"
            label={translate('Decide automatically')}
            description={translate(
              'Award the proposal as requested as soon as it reaches this step, without waiting for the call managers. They decide only when the award cannot be made automatically, such as when a score threshold or the award amounts stop it. An enabled step before it must be able to reject a proposal.',
            )}
          />
        )}
      </>
    ),

    participants: (
      <>
        {show('completer') && (
          <SelectGroup
            name="completer"
            label={translate('Responsible role')}
            required={true}
            options={responsibleRoleOptions}
            simpleValue={true}
            placeholder={translate('Select...')}
            validate={required}
          />
        )}

        {show('completer_proposal_role') && (
          <SelectGroup
            name="completer_proposal_role"
            label={translate('Evaluator role')}
            description={translate(
              'The holders of this role on each proposal complete the step.',
            )}
            required={true}
            options={proposalRoleOptions}
            simpleValue={true}
            isClearable={false}
            placeholder={translate('Select...')}
            validate={required}
            noOptionsMessage={() =>
              translate('The call has no evaluator roles yet.')
            }
          />
        )}

        {show('assigns_roles') && (
          <SelectGroup
            name="assigns_roles"
            label={translate('Assigns roles')}
            description={translate(
              'The evaluator roles whose holders are picked in this step, such as a lead and a second rapporteur. It cannot complete until each role has the holders it requires.',
            )}
            options={proposalRoleOptions}
            simpleValue={true}
            isMulti={true}
            isClearable={true}
            placeholder={translate('Select...')}
            noOptionsMessage={() =>
              translate(
                'The call has no evaluator roles yet. Add them under Configuration, Evaluator roles.',
              )
            }
          />
        )}

        {show('contributor_source') && (
          <SelectGroup
            name="contributor_source"
            label={translate('Contributors')}
            description={translate(
              'Who contributes to the step, each with a contribution and a form of their own.',
            )}
            options={contributorSourceOptions}
            simpleValue={true}
            isClearable={false}
            disabled={values.per_requested_offering}
          />
        )}

        {show('per_requested_offering') && (
          <BooleanGroup
            name="per_requested_offering"
            label={translate('One contribution per requested offering')}
            description={translate(
              "Each offering the proposal requests gets a contribution of its own, which any member of that offering's team may fill. Needed for the per-offering outcomes.",
            )}
          />
        )}

        {leadOnlyAvailable && (
          <BooleanGroup
            name="contributors_lead_only"
            label={translate('Only the lead of this role contributes')}
            description={translate(
              "The role's lead alone gets a contribution, such as a consolidated report; the other holders read the step's inputs but write nothing here. When the role also completes the step, only its lead completes it. Changing the lead moves the contribution, and the step waits while the role has no lead.",
            )}
          />
        )}

        {delegationShown && (
          <SelectGroup
            name="delegable_to"
            label={translate('Can be handed to')}
            description={translate(
              'Who a contribution of this step can be handed to by whoever holds it, or by a call manager. The person it is handed to accepts or declines it, and then fills it alone while its holders read it.',
            )}
            options={delegationOptions}
            simpleValue={true}
            isClearable={false}
          />
        )}

        {(show('min_contributions') || show('max_contributions')) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
            {show('min_contributions') && (
              <div>
                <NumberGroup
                  name="min_contributions"
                  label={translate('Minimum contributions')}
                  description={translate(
                    'Contributions submitted before this step can complete. On a step of assigned reviewers, their submitted reviews.',
                  )}
                  min={0}
                />
              </div>
            )}
            {show('max_contributions') && (
              <div>
                <NumberGroup
                  name="max_contributions"
                  label={translate('Maximum contributions')}
                  description={translate(
                    'Most contributions the step takes; no limit when empty.',
                  )}
                  min={1}
                />
              </div>
            )}
          </div>
        )}

        {show('requires_coi_confirmation') && (
          <BooleanGroup
            name="requires_coi_confirmation"
            label={translate('Conflict of interest confirmation')}
            description={translate(
              'Evaluator must confirm absence of conflict of interest.',
            )}
          />
        )}

        {show('coi_declaration_text') && (
          <TextGroup
            name="coi_declaration_text"
            label={translate('Conflict-of-interest declaration')}
            description={translate(
              "What the evaluators confirm on this step. Leave empty for the call's declaration, or the platform's standard one. A change applies to confirmations made after it; earlier ones keep the words confirmed.",
            )}
            rows={3}
            maxLength={5000}
          />
        )}
      </>
    ),

    evaluation: (
      <>
        {show('outcome_set') && (
          <SelectGroup
            name="outcome_set"
            label={translate('Outcomes')}
            description={translate('What the step can be completed with.')}
            required={true}
            options={outcomeSetOptions}
            simpleValue={true}
            isClearable={false}
            validate={required}
          />
        )}

        {show('allows_conditional_acceptance') && (
          <BooleanGroup
            name="allows_conditional_acceptance"
            label={translate('Allow conditional acceptance')}
            description={translate(
              'Each partition may accept the proposal under conditions. Off, it accepts or rejects it.',
            )}
          />
        )}

        {show('on_negative') && (
          <RadioGroup
            name="on_negative"
            label={translate('On a negative outcome')}
            choices={onNegativeChoices}
          />
        )}

        {(show('min_reviewers') || show('min_score_threshold')) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
            {show('min_reviewers') && (
              <div>
                <NumberGroup
                  name="min_reviewers"
                  label={translate('Minimum reviewers')}
                  description={translate(
                    'Minimum reviews required before this step can complete.',
                  )}
                  min={0}
                />
              </div>
            )}
            {show('min_score_threshold') && (
              <div>
                <NumberGroup
                  name="min_score_threshold"
                  label={translate('Minimum score threshold')}
                  description={translate(
                    "Below this average score the step can only decline. A step without contributors that reads input steps takes the score of the latest of them that has one: its reviews' average, else its rating answers (a consensus grading).",
                  )}
                  min={0}
                  step={0.1}
                />
              </div>
            )}
          </div>
        )}

        {show('criteria') && (
          <FormGroup label={translate('Criteria')}>
            <CriteriaListField
              name="criteria"
              locked={Boolean(step?.criteria_locked)}
            />
          </FormGroup>
        )}

        {show('blind_review') && (
          <BooleanGroup
            name="blind_review"
            label={translate('Blind review')}
            description={translate(
              "Evaluators cannot see each other's assessments.",
            )}
          />
        )}

        {show('checklist') && (
          <SelectGroup
            name="checklist"
            label={translate('Checklist')}
            description={translate(
              "Attach a checklist (evaluation form) for this step: one the whole portal shares or one of the call's organization.",
            )}
            options={checklistOptions}
            simpleValue={true}
            isClearable={true}
            placeholder={translate('Select...')}
          />
        )}

        {show('checklist_required') && (
          <BooleanGroup
            name="checklist_required"
            label={translate('Checklist required')}
            description={translate(
              'Block completing this step until the checklist’s required questions are answered.',
            )}
          />
        )}
      </>
    ),

    inputs: (
      <>
        {show('input_steps') && (
          <SelectGroup
            name="input_steps"
            label={translate('Input steps')}
            description={
              kind.id === 'applicant_action'
                ? translate(
                    'Earlier steps whose public parts the applicant reads while this step runs and afterwards: reviews without private comments, and the submitted contributions of steps with contributors.',
                  )
                : translate(
                    "Earlier steps whose outputs -- contributions, reviews, answers and outcome -- this step's contributors and completer read.",
                  )
            }
            options={inputOptions}
            simpleValue={true}
            isMulti={true}
            isClearable={true}
            placeholder={translate('Select...')}
            noOptionsMessage={() => translate('No step comes before this one.')}
          />
        )}
        {showsHiddenReviews && (
          <AlertItem
            variant="warning"
            className="mb-5"
            title={translate(
              'Applicants will see these reviews while they respond, even though this call hides reviews.',
            )}
          />
        )}

        {show('applicant_visible') && (
          <BooleanGroup
            name="applicant_visible"
            label={translate('Applicant visible')}
            // Says what *off* does, not just what on does. Off is the default
            // and the flag is honoured on the applicant's tracker, so a call
            // manager who reads only the on-case will not realise the step is
            // hidden from applicants until one asks.
            description={translate(
              'On, applicants see this step by name on their progress tracker. Off, they see only that their proposal is in review while it runs.',
            )}
          />
        )}

        {show('release_to_applicant') && (
          <BooleanGroup
            name="release_to_applicant"
            label={translate('Release the report to the applicant')}
            description={translate(
              'Once the step is completed, its completer or a call manager may release its report -- a consolidated report or final feedback -- to the applicant, as written or edited. Released, the applicant reads it whatever the call says about showing reviews.',
            )}
          />
        )}

        {show('allows_change_requests') && (
          <BooleanGroup
            name="allows_change_requests"
            label={translate('Allow requesting changes')}
            description={translate(
              'Whoever acts on the step may send the proposal back to the applicant to change the parts they unlock, as often as needed. The proposal stays in review on the step meanwhile.',
            )}
          />
        )}

        {show('collects_reviewer_suggestions') && (
          <BooleanGroup
            name="collects_reviewer_suggestions"
            label={translate('Collect reviewer suggestions')}
            description={translate(
              'While the step runs, each holder of the evaluator role suggests reviewers for the proposal. Call managers invite them to the reviewer pool; the applicant never sees them.',
            )}
          />
        )}

        {show('status_labels') && (
          <StatusLabelsFields kind={kind} values={values} />
        )}
      </>
    ),

    timing: (
      <>
        {show('project_end_offset_days') && (
          <NumberGroup
            name="project_end_offset_days"
            label={translate('Days before the project ends')}
            description={
              values.phase === 'closing'
                ? translate(
                    'On the first step of the closing: the final report opens this many days before the project ends, an extension included (0: on the end date).',
                  )
                : translate(
                    'On the first step of the extension: an extension can be requested until this many days before the project ends.',
                  )
            }
            min={0}
          />
        )}

        {show('duration_in_days') && (
          <NumberGroup
            name="duration_in_days"
            label={translate('Estimated duration (days)')}
            description={translate(
              'Days allowed for this step. Used to compute the deadline.',
            )}
            min={0}
          />
        )}

        {show('transition_mode') && (
          <RadioGroup
            name="transition_mode"
            label={translate('Transition mode options')}
            required={true}
            choices={transitionModeChoices}
            validate={required}
          />
        )}

        {show('parallel_with_previous') && (
          <BooleanGroup
            name="parallel_with_previous"
            label={translate('Runs alongside the previous step')}
            description={translate(
              'The step starts together with the step before it, and the steps after both wait until both have ended.',
            )}
          />
        )}

        {show('round_scoped') && (
          <BooleanGroup
            name="round_scoped"
            label={translate('Runs once per round')}
            description={translate(
              "For a meeting after the cut-off: the call managers open the step for the round's proposals together, each of its people writes one round report covering their proposals, and the step is completed for the round, never on one proposal. Needs evaluation at the cut-off.",
            )}
          />
        )}

        {show('run_condition_step') && (
          <SelectGroup
            name="run_condition_step"
            label={translate('Run only when')}
            description={translate(
              'Leave empty to run the step on every proposal. Otherwise it runs only when this earlier step, or one of its contributions, ends with one of the outcomes below; other proposals skip it.',
            )}
            options={conditionStepChoices}
            simpleValue={true}
            isClearable={true}
            placeholder={translate('Every proposal')}
            noOptionsMessage={() => translate('No step comes before this one.')}
          />
        )}

        {show('run_condition_kind') && (
          <RadioGroup
            name="run_condition_kind"
            label={translate('Decided by')}
            choices={RUN_CONDITION_KIND_CHOICES()}
          />
        )}

        {show('run_condition_score_spread') && (
          <NumberGroup
            name="run_condition_score_spread"
            label={translate('Scores more than this many points apart')}
            description={translate(
              "The step runs only when the highest and the lowest score that step's reviews or contributions gave the proposal differ by more than this. With fewer than two scores the proposal skips it.",
            )}
            min={0}
            step={0.5}
            required={true}
            validate={requiredSpread}
          />
        )}

        {show('run_condition_outcomes') && (
          <SelectGroup
            name="run_condition_outcomes"
            label={translate('Ending with')}
            options={conditionOutcomeChoices}
            simpleValue={true}
            isMulti={true}
            isClearable={true}
            required={true}
            validate={requiredOutcomes}
            placeholder={translate('Select...')}
          />
        )}

        {show('allocation_time') && (
          <SelectGroup
            name="allocation_time"
            label={translate('Allocation timing')}
            description={translate(
              'When a granted proposal takes effect: immediately on the decision, or on the fixed allocation date set per round.',
            )}
            required={true}
            options={getAllocationTimeOptions()}
            simpleValue={true}
            isClearable={false}
            validate={required}
          />
        )}
      </>
    ),
  };

  // Every page stays mounted, the others hidden, so a required field on a
  // page not shown still holds the dialog back from saving.
  return (
    <>
      {has('per_requested_offering') && (
        <SyncPerOfferingSource values={values} />
      )}
      {pages.map((key) =>
        key === 'check' ? null : (
          <div
            key={key}
            hidden={key !== page}
            data-testid={`step-form-page-${key}`}
          >
            {sections[key]}
          </div>
        ),
      )}
    </>
  );
};
