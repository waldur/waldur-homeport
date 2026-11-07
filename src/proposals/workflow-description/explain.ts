import {
  WorkflowDescription,
  WorkflowDescriptionRef,
  WorkflowDescriptionRoleCell,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import {
  fieldPage,
  StepFormPage,
  stepFormPageLabel,
} from '@/proposals/update/workflow-steps/stepForm';

/** The flags of a role cell, in the order the matrix shows them. */
export const CELL_FLAGS = [
  'sees',
  'reads_outputs',
  'contributes',
  'completes',
] as const;
export type CellFlag = (typeof CELL_FLAGS)[number] | 'notified';

export const cellFlagLabel = (flag: CellFlag): string =>
  ({
    sees: translate('Sees the step'),
    reads_outputs: translate('Reads its outputs'),
    contributes: translate('Contributes'),
    completes: translate('Completes'),
    notified: translate('Notified'),
  })[flag];

const STEP_FIELD_LABELS = (): Record<string, string> => ({
  name: translate('Name'),
  description: translate('Description'),
  notification_rules: translate('Notification rules'),
  run_condition: translate('Run condition'),
  status_labels: translate('Status labels'),
  transition_mode: translate('Transition'),
  outcome_set: translate('Outcomes'),
  on_negative: translate('On a negative outcome'),
  assigns_roles: translate('Assigns roles'),
  checklist: translate('Checklist'),
  min_score_threshold: translate('Minimum score'),
  responsible_role: translate('Completed by'),
  kind: translate('Kind'),
  completer: translate('Completed by'),
  completer_proposal_role: translate('Completing evaluator role'),
  contributor_source: translate('Contributors'),
  contributors_lead_only: translate('Only the lead contributes'),
  per_requested_offering: translate('One contribution per requested offering'),
  delegable_to: translate('Can be handed to'),
  input_steps: translate('Reads the outputs of'),
  applicant_visible: translate('Visible to applicant'),
  release_to_applicant: translate('Report released to the applicant'),
  blind_review: translate('Blind review'),
  is_allocation_decision: translate('Allocation decision'),
  decides_automatically: translate('Decides automatically'),
  duration_in_days: translate('Duration'),
  recipient: translate('Notification rule'),
  proposal_role: translate('Notification rule'),
});

/** A step setting, by the label its dialog gives it. */
export const stepFieldLabel = (field: string): string => {
  const label = STEP_FIELD_LABELS()[field];
  if (label) return label;
  const words = field.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const ENGINE_LABELS = (): Record<string, string> => ({
  oversees_call: translate('Call managers oversee every step of their call.'),
  evaluator_reads_step_list: translate(
    "Everyone evaluating on the call reads the proposal's step list.",
  ),
});

const CALL_FIELD_LABELS = (): Record<string, string> => ({
  reviews_visible_to_submitters: translate(
    'Call setting: reviews are visible to applicants.',
  ),
  panel_chair: translate('Call setting: panel chair and vice-chair.'),
  requested_offerings: translate("The call's requested offerings."),
});

const stepNameOf = (description: WorkflowDescription | undefined, key) =>
  description?.steps.find((step) => step.key === key)?.name ?? key;

/** One reason, in words, with the dialog page holding its field. */
export const explainRef = (
  ref: WorkflowDescriptionRef,
  description?: WorkflowDescription,
): string => {
  if (ref.source === 'engine') {
    return ENGINE_LABELS()[ref.field] ?? ref.field;
  }
  if (ref.source === 'call') {
    return CALL_FIELD_LABELS()[ref.field] ?? ref.field;
  }
  const label = STEP_FIELD_LABELS()[ref.field] ?? ref.field;
  const step = stepNameOf(description, ref.step);
  if (ref.source === 'rule') {
    return translate('Notification rule of {step} ({trigger})', {
      step,
      trigger: ref.detail ?? '',
    });
  }
  const page = fieldPage(ref.field);
  return page
    ? translate("{field} of {step} (page '{page}')", {
        field: label,
        step,
        page: stepFormPageLabel(page),
      })
    : translate('{field} of {step}', { field: label, step });
};

/** Where clicking a cell takes the call manager: the step and dialog page
 * holding the first field that made it so. */
export const cellTarget = (
  cell: WorkflowDescriptionRoleCell,
  flag: CellFlag,
): { step: string; page: StepFormPage } | undefined => {
  for (const ref of cell[flag].because) {
    if (ref.source !== 'step' || !ref.step) continue;
    const page = fieldPage(ref.field);
    if (page) return { step: ref.step, page };
  }
  return undefined;
};
