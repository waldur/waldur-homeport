import { FORM_ERROR } from 'final-form';
import {
  CallStepKindEnum,
  CallWorkflowStep,
  OnNegativeEnum,
  OutcomeSetEnum,
  PatchedCallWorkflowStepRequest,
  StepKind,
  StepStatusLabels,
  WorkflowCriterionRequest,
} from 'waldur-js-client';

import { getErrorBody } from '@/core/ErrorMessageFormatter';
import { translate } from '@/i18n';
import { AllocationTime } from '@/proposals/types';
import {
  hasNegativeOutcome,
  kindHasField,
  ResponsibleRoleEnum,
  TransitionModeEnum,
} from '@/proposals/workflow/constants';
import { cleanStatusLabels } from '@/proposals/workflow/statusLabels';

interface CriterionInput {
  name: string;
  order: number;
  /** Relative to the step's other criteria; 1 when left empty. */
  weight?: number | string | null;
}

export interface StepFormValues {
  kind?: CallStepKindEnum | null;
  name: string;
  description: string;
  is_enabled: boolean;
  outcome_set: OutcomeSetEnum | null;
  on_negative: OnNegativeEnum;
  completer: ResponsibleRoleEnum | null;
  completer_proposal_role: string | null;
  assigns_roles: string[];
  duration_in_days: number | null;
  transition_mode: TransitionModeEnum | null;
  is_allocation_decision: boolean;
  decides_automatically: boolean;
  allocation_time: AllocationTime;
  min_reviewers: number | null;
  min_contributions: number | null;
  max_contributions: number | null;
  contributor_source: string;
  per_requested_offering: boolean;
  /** Per-offering outcomes: whether a partition may accept under conditions. */
  allows_conditional_acceptance: boolean;
  contributors_lead_only: boolean;
  delegable_to: string;
  min_score_threshold: string | null;
  blind_review: boolean;
  requires_coi_confirmation: boolean;
  /** The step's own conflict-of-interest declaration; empty for the call's. */
  coi_declaration_text: string;
  criteria: CriterionInput[];
  checklist: string | null;
  checklist_required: boolean;
  applicant_visible: boolean;
  input_steps: string[];
  release_to_applicant: boolean;
  collects_reviewer_suggestions: boolean;
  parallel_with_previous: boolean;
  /** Key of the earlier step whose outcome decides whether this one runs. */
  run_condition_step: string | null;
  /** Whether the step runs on that step's outcomes or on its scores. */
  run_condition_kind: RunConditionKind;
  run_condition_outcomes: string[];
  /** Points by which that step's scores must differ for this one to run. */
  run_condition_score_spread: number | null;
  allows_change_requests: boolean;
  /** Run once per round: opened for the round and completed for it. */
  round_scoped: boolean;
  /** When the step runs: in the evaluation, an extension or the closing. */
  phase: WorkflowPhase;
  project_end_offset_days: number | null;
  /** What each audience's dashboard calls the step; see statusLabels.ts. */
  status_labels: StepStatusLabels;
}

export type WorkflowPhase = 'evaluation' | 'extension' | 'closing';

type RunConditionKind = 'outcomes' | 'score_spread';

/** Whether a step of `phase` runs on an accepted proposal, in a run. */
const isPostAward = (phase: WorkflowPhase | null | undefined) =>
  phase === 'extension' || phase === 'closing';

// Hoisted to module scope so the reference is stable across renders: an
// inline object would make react-final-form re-initialise the form on every
// render and wipe what the user typed.
export const EMPTY_STEP_VALUES: StepFormValues = {
  kind: null,
  name: '',
  description: '',
  is_enabled: true,
  outcome_set: null,
  on_negative: 'reject',
  completer: null,
  completer_proposal_role: null,
  assigns_roles: [],
  duration_in_days: null,
  transition_mode: 'automatic_on_completion',
  is_allocation_decision: false,
  decides_automatically: false,
  allocation_time: 'on_decision',
  min_reviewers: null,
  min_contributions: null,
  max_contributions: null,
  contributor_source: 'none',
  per_requested_offering: false,
  allows_conditional_acceptance: true,
  contributors_lead_only: false,
  delegable_to: '',
  min_score_threshold: null,
  blind_review: false,
  requires_coi_confirmation: false,
  coi_declaration_text: '',
  criteria: [],
  checklist: '',
  checklist_required: true,
  applicant_visible: false,
  input_steps: [],
  release_to_applicant: false,
  collects_reviewer_suggestions: false,
  parallel_with_previous: false,
  run_condition_step: null,
  run_condition_kind: 'outcomes',
  run_condition_outcomes: [],
  run_condition_score_spread: null,
  allows_change_requests: false,
  round_scoped: false,
  phase: 'evaluation',
  project_end_offset_days: null,
  status_labels: {},
};

/**
 * The step's `delegable_to` as the form names it: an evaluator role by its
 * uuid, which the role picker offers, whatever the backend stored.
 */
const delegableToValue = (step: CallWorkflowStep): string => {
  const value = step.delegable_to || '';
  if (value.startsWith('proposal_role:') && step.delegable_proposal_role_uuid) {
    return `proposal_role:${step.delegable_proposal_role_uuid}`;
  }
  return value;
};

/**
 * Whether a step's slots can be handed on at all: per-offering slots go to
 * the offering's team, a person's slot -- of an evaluator or call role -- to
 * the holders of an evaluator role.
 */
const hasDelegableSlots = (values: StepFormValues): boolean =>
  Boolean(values.per_requested_offering) ||
  (values.contributor_source ?? '').startsWith('proposal_role:') ||
  (values.contributor_source ?? '').startsWith('call_role:');

/**
 * The `delegable_to` the step is saved with: only a target its slots allow,
 * else nobody.
 */
const delegableToBody = (values: StepFormValues): string => {
  const value = values.delegable_to || '';
  if (value === 'offering_team') {
    return values.per_requested_offering ? value : '';
  }
  if (value.startsWith('proposal_role:')) {
    return !values.per_requested_offering && hasDelegableSlots(values)
      ? value
      : '';
  }
  return '';
};

export const stepFormValues = (step: CallWorkflowStep): StepFormValues => ({
  kind: step.kind,
  name: step.name,
  description: step.description ?? '',
  is_enabled: step.is_enabled ?? true,
  outcome_set: step.outcome_set,
  on_negative: step.on_negative ?? 'reject',
  // Coerce the SDK's BlankEnum ('') to null so the select shows its placeholder.
  completer: (step.completer || null) as ResponsibleRoleEnum | null,
  completer_proposal_role: step.completer_proposal_role ?? null,
  assigns_roles: step.assigns_roles ?? [],
  duration_in_days: step.duration_in_days ?? null,
  transition_mode: (step.transition_mode ||
    'automatic_on_completion') as TransitionModeEnum,
  is_allocation_decision: step.is_allocation_decision ?? false,
  decides_automatically: step.decides_automatically ?? false,
  allocation_time: (step.allocation_time || 'on_decision') as AllocationTime,
  min_reviewers: step.min_reviewers ?? null,
  min_contributions: step.min_contributions ?? null,
  max_contributions: step.max_contributions ?? null,
  contributor_source: step.contributor_source || 'none',
  per_requested_offering: step.per_requested_offering ?? false,
  allows_conditional_acceptance: step.allows_conditional_acceptance ?? true,
  contributors_lead_only: step.contributors_lead_only ?? false,
  delegable_to: delegableToValue(step),
  min_score_threshold: step.min_score_threshold ?? null,
  blind_review: step.blind_review ?? false,
  requires_coi_confirmation: step.requires_coi_confirmation ?? false,
  coi_declaration_text: step.coi_declaration_text ?? '',
  criteria: (step.criteria ?? [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((c, index) => ({
      name: c.name ?? '',
      order: index,
      weight: c.weight ?? 1,
    })),
  checklist: step.checklist ?? '',
  checklist_required: step.checklist_required ?? true,
  applicant_visible: step.applicant_visible ?? false,
  input_steps: step.input_steps ?? [],
  release_to_applicant: step.release_to_applicant ?? false,
  collects_reviewer_suggestions: step.collects_reviewer_suggestions ?? false,
  parallel_with_previous: step.parallel_with_previous ?? false,
  run_condition_step: step.run_condition?.step || null,
  run_condition_kind:
    step.run_condition?.score_spread_above != null
      ? 'score_spread'
      : 'outcomes',
  run_condition_outcomes: step.run_condition?.outcomes ?? [],
  run_condition_score_spread: step.run_condition?.score_spread_above ?? null,
  allows_change_requests: step.allows_change_requests ?? false,
  round_scoped: step.round_scoped ?? false,
  phase: (step.phase || 'evaluation') as WorkflowPhase,
  project_end_offset_days: step.project_end_offset_days ?? null,
  status_labels: step.status_labels ?? {},
});

/**
 * The evaluator role a `proposal_role:<id or uuid>` contributor source names,
 * among the call's roles. A source naming the role by its id is resolved
 * through `roleUuid`, the step's own record of it.
 */
export const contributorRole = <T extends { uuid: string }>(
  source: string | null | undefined,
  roles: T[] | undefined,
  roleUuid?: string | null,
): T | undefined => {
  if (!(source ?? '').startsWith('proposal_role:')) return undefined;
  const ref = (source ?? '').slice('proposal_role:'.length).replace(/-/g, '');
  return (roles ?? []).find(
    (role) => role.uuid === ref || (!!roleUuid && role.uuid === roleUuid),
  );
};

// A count the call manager may leave empty, where 0 is a value of its own.
const optionalCount = (value: unknown): number | null =>
  value === null || value === undefined || value === '' ? null : Number(value);

const normalizeCriteria = (
  criteria: CriterionInput[] | undefined,
): WorkflowCriterionRequest[] =>
  (criteria ?? [])
    .map((c, index) => ({
      name: (c.name ?? '').trim(),
      order: index,
      // Left empty, a criterion weighs as much as one at 1.
      weight:
        c.weight === null || c.weight === undefined || c.weight === ''
          ? 1
          : Number(c.weight),
    }))
    .filter((c) => c.name.length > 0);

/**
 * The request body for a step of `kind`: only the fields its kind is
 * configured with, so a field another kind owns is never sent.
 */
export const buildStepBody = (
  values: StepFormValues,
  kind: StepKind | undefined,
): PatchedCallWorkflowStepRequest => {
  const has = (field: string) => kindHasField(kind, field);
  const postAward = isPostAward(values.phase);
  const body: PatchedCallWorkflowStepRequest = {};
  if (has('name')) body.name = values.name.trim();
  if (has('description')) body.description = values.description ?? '';
  if (has('outcome_set') && values.outcome_set) {
    body.outcome_set = values.outcome_set;
  }
  if (has('on_negative')) body.on_negative = values.on_negative;
  if (has('completer')) body.completer = values.completer || null;
  // The evaluator role completing the step goes with the proposal_role
  // completer, and only with it.
  if (has('completer_proposal_role')) {
    body.completer_proposal_role =
      values.completer === 'proposal_role'
        ? values.completer_proposal_role || null
        : null;
  }
  if (has('assigns_roles')) body.assigns_roles = values.assigns_roles ?? [];
  if (has('duration_in_days')) {
    body.duration_in_days = values.duration_in_days || null;
  }
  // An automatic decision moves on by itself: the backend refuses one that
  // waits for a manual advance.
  const decidesAutomatically =
    has('decides_automatically') &&
    !!values.is_allocation_decision &&
    !!values.decides_automatically;
  if (has('transition_mode')) {
    body.transition_mode = decidesAutomatically
      ? 'automatic_on_completion'
      : values.transition_mode || 'automatic_on_completion';
  }
  if (has('is_allocation_decision')) {
    body.is_allocation_decision = !!values.is_allocation_decision;
  }
  if (has('decides_automatically')) {
    body.decides_automatically = decidesAutomatically;
  }
  // Allocation timing belongs to the allocation decision alone; the backend
  // refuses a fixed date anywhere else.
  if (has('allocation_time') && values.is_allocation_decision) {
    body.allocation_time = values.allocation_time;
  }
  if (has('min_reviewers'))
    body.min_reviewers = optionalCount(values.min_reviewers);
  if (has('min_contributions')) {
    body.min_contributions = optionalCount(values.min_contributions);
  }
  if (has('max_contributions')) {
    // A per-offering step takes one contribution from each offering: the
    // backend refuses a maximum there.
    body.max_contributions = values.per_requested_offering
      ? null
      : values.max_contributions || null;
  }
  if (has('contributor_source')) {
    body.contributor_source = values.contributor_source || 'none';
  }
  if (has('per_requested_offering')) {
    body.per_requested_offering = !!values.per_requested_offering;
  }
  if (has('allows_conditional_acceptance')) {
    // Only per-offering outcomes include a conditional acceptance.
    body.allows_conditional_acceptance =
      values.outcome_set !== 'per_offering' ||
      !!values.allows_conditional_acceptance;
  }
  if (has('contributors_lead_only')) {
    // Only the holders of an evaluator role have a lead.
    body.contributors_lead_only =
      !!values.contributors_lead_only &&
      (values.contributor_source ?? '').startsWith('proposal_role:');
  }
  if (has('delegable_to')) body.delegable_to = delegableToBody(values);
  if (has('min_score_threshold')) {
    body.min_score_threshold = values.min_score_threshold || null;
  }
  if (has('blind_review')) body.blind_review = !!values.blind_review;
  if (has('requires_coi_confirmation')) {
    body.requires_coi_confirmation = !!values.requires_coi_confirmation;
  }
  if (has('coi_declaration_text')) {
    body.coi_declaration_text = values.requires_coi_confirmation
      ? (values.coi_declaration_text ?? '').trim()
      : '';
  }
  if (has('criteria')) body.criteria = normalizeCriteria(values.criteria);
  if (has('checklist')) body.checklist = values.checklist || null;
  if (has('checklist_required')) {
    body.checklist_required = !!values.checklist_required;
  }
  if (has('applicant_visible')) {
    body.applicant_visible = !!values.applicant_visible;
  }
  if (has('input_steps')) body.input_steps = values.input_steps ?? [];
  if (has('release_to_applicant')) {
    body.release_to_applicant = !!values.release_to_applicant;
  }
  if (has('collects_reviewer_suggestions')) {
    // Only the holders of an evaluator role suggest reviewers.
    body.collects_reviewer_suggestions =
      !!values.collects_reviewer_suggestions &&
      (values.contributor_source ?? '').startsWith('proposal_role:');
  }
  if (has('parallel_with_previous')) {
    // The allocation decision and applicant steps run alone.
    body.parallel_with_previous =
      !!values.parallel_with_previous && runsInStage(kind, values);
  }
  if (has('run_condition')) body.run_condition = runConditionBody(values);
  if (has('allows_change_requests')) {
    // Never on the allocation decision: the award changes through it.
    // After the award no step is the allocation decision.
    body.allows_change_requests =
      !!values.allows_change_requests &&
      (postAward || !values.is_allocation_decision);
  }
  if (has('phase')) body.phase = values.phase || 'evaluation';
  if (has('project_end_offset_days')) {
    body.project_end_offset_days = postAward
      ? optionalCount(values.project_end_offset_days)
      : null;
  }
  if (postAward) {
    // A post-award step settles no award and runs on every run.
    if (has('is_allocation_decision')) body.is_allocation_decision = false;
    if (has('decides_automatically')) body.decides_automatically = false;
    if (has('run_condition')) body.run_condition = null;
  }
  if (has('round_scoped')) {
    // Never the allocation decision, which settles each award, nor a step
    // after the award, which runs on one accepted proposal.
    body.round_scoped =
      !!values.round_scoped && !values.is_allocation_decision && !postAward;
  }
  if (has('status_labels')) {
    body.status_labels = cleanStatusLabels(values.status_labels);
  }
  return body;
};

/**
 * The run condition the form describes: the earlier step and either the
 * outcomes it runs on or the score spread; null to run on every proposal.
 */
export const runConditionBody = (
  values: Pick<
    StepFormValues,
    | 'run_condition_step'
    | 'run_condition_kind'
    | 'run_condition_outcomes'
    | 'run_condition_score_spread'
    | 'is_allocation_decision'
  >,
): PatchedCallWorkflowStepRequest['run_condition'] => {
  if (!values.run_condition_step || values.is_allocation_decision) return null;
  if (values.run_condition_kind === 'score_spread') {
    const spread = values.run_condition_score_spread;
    return spread === null || spread === undefined || (spread as any) === ''
      ? null
      : { step: values.run_condition_step, score_spread_above: Number(spread) };
  }
  return (values.run_condition_outcomes ?? []).length
    ? {
        step: values.run_condition_step,
        outcomes: values.run_condition_outcomes,
      }
    : null;
};

/** Whether a step may run alongside the one before it: never the
 * allocation decision, nor a step of the applicant. */
const runsInStage = (kind: StepKind | undefined, values: StepFormValues) =>
  kind?.id !== 'applicant_action' && !values.is_allocation_decision;

/**
 * Why the allocation decision cannot move on this call, if the call says so.
 * An active call keeps its allocation decision where it is: the backend
 * refuses to unflag it, and a second one besides it. A draft call that has
 * received proposals refuses the move too, which the dialog reports from the
 * backend's answer.
 */
export const allocationDecisionLockedReason = (call: {
  state?: string;
}): string | undefined =>
  call.state === 'active'
    ? translate(
        'The call is active, so its allocation decision stays on the step it is on.',
      )
    : undefined;

// API field names that the dialogs show under another name.
const FIELD_ALIASES: Record<string, keyof StepFormValues> = {
  key: 'name',
  step: 'name',
  responsible_role: 'completer',
};

const FORM_FIELDS = Object.keys(EMPTY_STEP_VALUES);

const asText = (value: unknown): string[] => {
  if (value == null) return [];
  if (Array.isArray(value)) return value.flatMap(asText);
  if (typeof value === 'object') return Object.values(value).flatMap(asText);
  return [String(value)];
};

/**
 * Final Form submission errors from a refused save: a message about one of
 * the dialog's fields goes under that field, anything else -- a step that
 * proposals have already walked, a second allocation decision on the call --
 * into the dialog's banner. Undefined for anything but a validation error,
 * which the caller reports as usual.
 */
export const stepSubmissionErrors = (
  error: any,
): Record<string, any> | undefined => {
  const status = error?.status ?? error?.response?.status;
  if (status !== 400) return undefined;
  const body = getErrorBody(error) ?? {};
  const fieldErrors: Record<string, string> = {};
  const general: string[] = [];
  for (const [key, value] of Object.entries(body)) {
    const field = FIELD_ALIASES[key] ?? key;
    const messages = asText(value);
    if (FORM_FIELDS.includes(field) && field !== 'kind') {
      fieldErrors[field] = messages.join(' ');
    } else {
      general.push(...messages);
    }
  }
  // The banner sits at the top of a long dialog, so it repeats what the
  // fields say rather than pointing at a field that may be scrolled away.
  const messages = general.length ? general : Object.values(fieldErrors);
  return {
    ...fieldErrors,
    [FORM_ERROR]: messages.length
      ? messages.join(' ')
      : translate('The request was refused.'),
  };
};

/**
 * The pages of the step dialogs, in order. A step's settings run long, so
 * the dialogs show them a page at a time.
 */
export type StepFormPage =
  'basics' | 'participants' | 'evaluation' | 'inputs' | 'timing' | 'check';

const STEP_FORM_PAGES: StepFormPage[] = [
  'basics',
  'participants',
  'evaluation',
  'inputs',
  'timing',
];

export const stepFormPageLabel = (page: StepFormPage): string =>
  ({
    basics: translate('Basics'),
    participants: translate('Participants'),
    evaluation: translate('Outcome and review'),
    inputs: translate('Inputs and visibility'),
    timing: translate('Timing'),
    check: translate('Check'),
  })[page];

/** The page each field of the dialogs is on. */
const FIELD_PAGES: Record<keyof StepFormValues, StepFormPage> = {
  kind: 'basics',
  name: 'basics',
  description: 'basics',
  is_enabled: 'basics',
  is_allocation_decision: 'basics',
  decides_automatically: 'basics',
  completer: 'participants',
  completer_proposal_role: 'participants',
  assigns_roles: 'participants',
  contributor_source: 'participants',
  per_requested_offering: 'participants',
  contributors_lead_only: 'participants',
  delegable_to: 'participants',
  min_contributions: 'participants',
  max_contributions: 'participants',
  requires_coi_confirmation: 'participants',
  coi_declaration_text: 'participants',
  outcome_set: 'evaluation',
  allows_conditional_acceptance: 'evaluation',
  on_negative: 'evaluation',
  min_reviewers: 'evaluation',
  min_score_threshold: 'evaluation',
  criteria: 'evaluation',
  blind_review: 'evaluation',
  checklist: 'evaluation',
  checklist_required: 'evaluation',
  input_steps: 'inputs',
  applicant_visible: 'inputs',
  release_to_applicant: 'inputs',
  collects_reviewer_suggestions: 'inputs',
  allows_change_requests: 'inputs',
  status_labels: 'inputs',
  duration_in_days: 'timing',
  transition_mode: 'timing',
  allocation_time: 'timing',
  parallel_with_previous: 'timing',
  round_scoped: 'timing',
  run_condition_step: 'timing',
  run_condition_kind: 'timing',
  run_condition_outcomes: 'timing',
  run_condition_score_spread: 'timing',
  phase: 'basics',
  project_end_offset_days: 'timing',
};

// API fields the dialogs edit under another name.
const API_FIELD_PAGES: Record<string, StepFormPage> = {
  run_condition: 'timing',
  responsible_role: 'participants',
};

/** The form field standing for an API field, for focusing it. */
export const fieldFormName = (field: string): string =>
  field === 'run_condition' ? 'run_condition_step' : field;

/** The dialog page holding a step field, by its form or API name. */
export const fieldPage = (field: string): StepFormPage | undefined =>
  FIELD_PAGES[field as keyof StepFormValues] ?? API_FIELD_PAGES[field];

// Form fields standing for one API field.
const CONFIG_FIELDS: Partial<Record<keyof StepFormValues, string>> = {
  run_condition_step: 'run_condition',
  run_condition_kind: 'run_condition',
  run_condition_outcomes: 'run_condition',
  run_condition_score_spread: 'run_condition',
};

const byRole = (values: StepFormValues) =>
  (values.contributor_source ?? '').startsWith('proposal_role:');

/**
 * Whether the dialogs show `field` for a step of `kind` with `values`: the
 * kind is configured with it, and whatever it depends on is set. Whether a
 * role has a lead is left to the dialog, which knows the call's roles.
 */
export const stepFieldShown = (
  field: keyof StepFormValues,
  kind: StepKind | undefined,
  values: StepFormValues,
  { showEnableSwitch = false }: { showEnableSwitch?: boolean } = {},
): boolean => {
  if (!kindHasField(kind, CONFIG_FIELDS[field] ?? field)) return false;
  switch (field) {
    case 'parallel_with_previous':
      return runsInStage(kind, values);
    case 'round_scoped':
      return (
        !values.is_allocation_decision &&
        !values.per_requested_offering &&
        !isPostAward(values.phase)
      );
    case 'run_condition_step':
      return !values.is_allocation_decision && !isPostAward(values.phase);
    case 'run_condition_kind':
      return (
        !values.is_allocation_decision &&
        !isPostAward(values.phase) &&
        !!values.run_condition_step
      );
    case 'run_condition_outcomes':
      return (
        !values.is_allocation_decision &&
        !isPostAward(values.phase) &&
        !!values.run_condition_step &&
        values.run_condition_kind !== 'score_spread'
      );
    case 'run_condition_score_spread':
      return (
        !values.is_allocation_decision &&
        !isPostAward(values.phase) &&
        !!values.run_condition_step &&
        values.run_condition_kind === 'score_spread'
      );
    case 'coi_declaration_text':
      return Boolean(values.requires_coi_confirmation);
    case 'allows_conditional_acceptance':
      return values.outcome_set === 'per_offering';
    case 'is_allocation_decision':
      return !isPostAward(values.phase);
    case 'project_end_offset_days':
      return isPostAward(values.phase);
    case 'is_enabled':
      return showEnableSwitch;
    case 'outcome_set':
      return (kind?.outcome_sets.length ?? 0) > 1;
    case 'on_negative':
      return hasNegativeOutcome(kind, values.outcome_set);
    case 'allocation_time':
    case 'decides_automatically':
      return (
        Boolean(values.is_allocation_decision) && !isPostAward(values.phase)
      );
    case 'transition_mode':
      return !(values.is_allocation_decision && values.decides_automatically);
    case 'completer_proposal_role':
      return values.completer === 'proposal_role';
    case 'checklist_required':
      return Boolean(values.checklist);
    case 'contributors_lead_only':
    case 'collects_reviewer_suggestions':
      return byRole(values);
    case 'delegable_to':
      return hasDelegableSlots(values);
    case 'allows_change_requests':
      return !values.is_allocation_decision;
    case 'max_contributions':
      return !values.per_requested_offering;
    default:
      return true;
  }
};

/**
 * The pages a step of `kind` has: those with a field to show. The first page
 * is always there -- the Add dialog asks for the kind on it.
 */
export const stepFormPages = (
  kind: StepKind | undefined,
  values: StepFormValues,
  options: { showEnableSwitch?: boolean; withCheck?: boolean } = {},
): StepFormPage[] => {
  if (!kind) return ['basics'];
  const fields = Object.keys(FIELD_PAGES) as (keyof StepFormValues)[];
  const pages = STEP_FORM_PAGES.filter(
    (page) =>
      page === 'basics' ||
      fields.some(
        (field) =>
          FIELD_PAGES[field] === page &&
          stepFieldShown(field, kind, values, options),
      ),
  );
  // The configure dialog ends on a page reading back what will be saved.
  return options.withCheck ? [...pages, 'check'] : pages;
};

/** The fields `page` shows for a step of `kind` with `values`. */
export const pageFields = (
  page: StepFormPage,
  kind: StepKind | undefined,
  values: StepFormValues,
  options: { showEnableSwitch?: boolean } = {},
): (keyof StepFormValues)[] =>
  (Object.keys(FIELD_PAGES) as (keyof StepFormValues)[]).filter(
    (field) =>
      FIELD_PAGES[field] === page &&
      field !== 'kind' &&
      stepFieldShown(field, kind, values, options),
  );

// A field's error, or the errors of its items (criteria).
const isError = (error: unknown): boolean =>
  Array.isArray(error)
    ? error.some(isError)
    : error !== null && typeof error === 'object'
      ? Object.values(error).some(isError)
      : Boolean(error);

/**
 * The pages among `pages` holding a field with an error, in page order.
 * Errors of fields the dialogs do not know stay in the banner.
 */
export const pagesWithErrors = (
  pages: StepFormPage[],
  errors: Record<string, unknown> | undefined,
): StepFormPage[] => {
  const failing = new Set(
    Object.entries(errors ?? {})
      .filter(([field, error]) => field in FIELD_PAGES && isError(error))
      .map(([field]) => FIELD_PAGES[field as keyof StepFormValues]),
  );
  return pages.filter((page) => failing.has(page));
};
