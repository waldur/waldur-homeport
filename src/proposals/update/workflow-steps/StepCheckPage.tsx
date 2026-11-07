import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC, Fragment, useMemo } from 'react';
import { useFormState } from 'react-final-form';
import { CallWorkflowStep, StepKind } from 'waldur-js-client';

import { AlertItem, BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import {
  useCallProposalRoles,
  useCallStepsNamingRoles,
} from '@/proposals/proposal-roles/queries';
import { criterionLabel } from '@/proposals/review/criteriaScore';
import {
  contributorSourceLabel,
  onNegativeLabel,
  outcomeLabel,
  responsibleRoleLabel,
  stepName,
  transitionModeLabel,
} from '@/proposals/workflow/constants';
import { countStatusLabels } from '@/proposals/workflow/statusLabels';
import { fromStepForm } from '@/proposals/workflow-description/formAdapter';
import { StepMailsSection } from '@/proposals/workflow-description/mail/StepMailsSection';
import { useCallWorkflowDescription } from '@/proposals/workflow-description/queries';
import { formatStepSummary } from '@/proposals/workflow-description/summary';

import {
  pageFields,
  pagesWithErrors,
  StepFormPage,
  stepFormPageLabel,
  StepFormValues,
} from './stepForm';

const FIELD_LABELS = (): Partial<Record<keyof StepFormValues, string>> => ({
  name: translate('Name'),
  description: translate('Description'),
  is_enabled: translate('Enabled'),
  is_allocation_decision: translate('Allocation decision'),
  decides_automatically: translate('Decides automatically'),
  completer: translate('Completed by'),
  completer_proposal_role: translate('Completing evaluator role'),
  assigns_roles: translate('Assigns'),
  contributor_source: translate('Contributors'),
  per_requested_offering: translate('One contribution per requested offering'),
  contributors_lead_only: translate('Only the lead contributes'),
  delegable_to: translate('Can be handed to'),
  min_contributions: translate('Min contributions'),
  max_contributions: translate('Max contributions'),
  requires_coi_confirmation: translate('Conflict-of-interest confirmation'),
  coi_declaration_text: translate('Conflict-of-interest declaration'),
  outcome_set: translate('Outcomes'),
  allows_conditional_acceptance: translate('Conditional acceptance'),
  on_negative: translate('On a negative outcome'),
  min_reviewers: translate('Min reviews'),
  min_score_threshold: translate('Min score'),
  criteria: translate('Criteria'),
  blind_review: translate('Blind review'),
  checklist: translate('Evaluation form'),
  checklist_required: translate('Form required'),
  input_steps: translate('Reads the outputs of'),
  applicant_visible: translate('Visible to applicant'),
  release_to_applicant: translate('Report released to the applicant'),
  collects_reviewer_suggestions: translate('Collects reviewer suggestions'),
  allows_change_requests: translate('May request changes'),
  duration_in_days: translate('Duration (days)'),
  transition_mode: translate('Transition'),
  allocation_time: translate('Allocation timing'),
  parallel_with_previous: translate('Runs alongside the previous step'),
  run_condition_step: translate('Runs only when'),
  run_condition_kind: translate('Decided by'),
  run_condition_outcomes: translate('With outcomes'),
  run_condition_score_spread: translate(
    'Scores more than this many points apart',
  ),
  status_labels: translate('Status labels'),
});

const NOT_SET = () => translate('Not set');

interface CheckPageProps {
  pages: StepFormPage[];
  kind: StepKind | undefined;
  values: StepFormValues;
  callUuid: string;
  step?: CallWorkflowStep;
  showEnableSwitch: boolean;
  onChange(page: StepFormPage): void;
}

/**
 * The last page of the step dialog: what saving will do, in one sentence,
 * then each page's values with a link back to it. Read from the form's
 * unsaved values.
 */
export const StepCheckPage: FC<CheckPageProps> = ({
  pages,
  kind,
  values,
  callUuid,
  step,
  showEnableSwitch,
  onChange,
}) => {
  const { data: roles } = useCallProposalRoles(callUuid);
  const { data: steps } = useCallStepsNamingRoles(callUuid);
  const { data: description } = useCallWorkflowDescription(callUuid);
  const { errors, submitErrors, submitFailed } = useFormState<StepFormValues>({
    subscription: { errors: true, submitErrors: true, submitFailed: true },
  });
  const editable = pages.filter((page) => page !== 'check');
  const failing = pagesWithErrors(editable, {
    ...(submitFailed ? errors : {}),
    ...submitErrors,
  });

  const sentence = useMemo(
    () =>
      formatStepSummary(
        fromStepForm(values, { kind, roles, steps, step, description }),
      ),
    [values, kind, roles, steps, step, description],
  );

  const roleName = (ref: string | null | undefined) =>
    (roles ?? []).find(
      (role) =>
        role.uuid === (ref ?? '').replace(/^proposal_role:/, '') ||
        role.key === ref,
    )?.name ?? ref;
  const stepLabel = (ref: string) => {
    const found = (steps ?? []).find(
      (candidate) => candidate.uuid === ref || candidate.key === ref,
    );
    return found ? stepName(found) : ref;
  };

  const format = (field: keyof StepFormValues): string => {
    const value = values[field] as unknown;
    if (value === null || value === undefined || value === '') return NOT_SET();
    if (typeof value === 'boolean') {
      return value ? translate('Yes') : translate('No');
    }
    switch (field) {
      case 'completer':
        return responsibleRoleLabel(values.completer);
      case 'completer_proposal_role':
        return roleName(values.completer_proposal_role) ?? NOT_SET();
      case 'assigns_roles':
        return values.assigns_roles.length
          ? values.assigns_roles.map((ref) => roleName(ref)).join(', ')
          : NOT_SET();
      case 'contributor_source':
        return values.contributor_source.startsWith('proposal_role:')
          ? (roleName(values.contributor_source) ?? NOT_SET())
          : contributorSourceLabel(values.contributor_source);
      case 'delegable_to':
        return values.delegable_to === 'offering_team'
          ? translate("Anyone with a role on the slot's offering")
          : (roleName(values.delegable_to) ?? NOT_SET());
      case 'input_steps':
        return values.input_steps.length
          ? values.input_steps.map(stepLabel).join(', ')
          : NOT_SET();
      case 'run_condition_step':
        return stepLabel(values.run_condition_step ?? '');
      case 'run_condition_kind':
        return values.run_condition_kind === 'score_spread'
          ? translate('How far apart its scores lie')
          : translate('Its outcome');
      case 'run_condition_outcomes':
        return values.run_condition_outcomes.length
          ? values.run_condition_outcomes.map(outcomeLabel).join(', ')
          : NOT_SET();
      case 'on_negative':
        return onNegativeLabel(values.on_negative);
      case 'transition_mode':
        return transitionModeLabel(values.transition_mode);
      case 'outcome_set':
        return (
          kind?.outcome_sets.find((set) => set.id === values.outcome_set)
            ?.name ?? String(values.outcome_set)
        );
      case 'criteria':
        return values.criteria.length
          ? values.criteria
              .filter((criterion) => criterion.name)
              .map((criterion) => criterionLabel(criterion, values.criteria))
              .join(', ')
          : NOT_SET();
      case 'checklist':
        return translate('A form is attached');
      case 'status_labels': {
        const count = countStatusLabels(values.status_labels);
        return count
          ? translate('{count} configured', { count })
          : translate('Computed');
      }
      default:
        return Array.isArray(value)
          ? value.length
            ? value.join(', ')
            : NOT_SET()
          : String(value);
    }
  };

  const labels = FIELD_LABELS();
  return (
    <div className="flex flex-col gap-4" data-testid="step-check-page">
      {failing.length > 0 && (
        <AlertItem
          variant="error"
          title={translate('Some pages need attention: {pages}', {
            pages: failing.map(stepFormPageLabel).join(', '),
          })}
        />
      )}
      <p className="text-sm mb-0" data-testid="step-check-summary">
        {sentence}
      </p>
      {editable.map((page) => (
        <section key={page} data-testid={`step-check-${page}`}>
          <div className="flex items-center justify-between mb-1.5">
            <h6 className="mb-0 flex items-center gap-1.5">
              {failing.includes(page) && (
                <WarningCircleIcon
                  weight="bold"
                  className="text-danger"
                  aria-label={translate('(has errors)')}
                />
              )}
              {stepFormPageLabel(page)}
            </h6>
            <BaseButton
              variant="text-primary"
              size="sm"
              label={translate('Change')}
              onClick={() => onChange(page)}
            />
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-12 gap-x-5 mb-0">
            {pageFields(page, kind, values, { showEnableSwitch }).map(
              (field) => (
                <Fragment key={field}>
                  <dt className="sm:col-span-5 text-quaternary font-normal">
                    {labels[field] ?? field}
                  </dt>
                  <dd className="sm:col-span-7">{format(field)}</dd>
                </Fragment>
              ),
            )}
          </dl>
        </section>
      ))}
      {step && (
        <StepMailsSection
          callUuid={callUuid}
          stepKey={step.key}
          stepName={stepName(step)}
          description={description}
        />
      )}
    </div>
  );
};
