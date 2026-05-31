import { FORM_ERROR } from 'final-form';
import arrayMutators from 'final-form-arrays';
import { FC, useCallback, useMemo } from 'react';
import { Field, Form } from 'react-final-form';
import {
  CallWorkflowStep,
  PatchedCallWorkflowStepRequest,
  proposalProtectedCallsWorkflowStepsPartialUpdate,
  WorkflowCriterionRequest,
} from 'waldur-js-client';

import { AwesomeRadioButton } from '@/core/AwesomeRadioButton';
import { required } from '@/core/validators';
import { NumberField, SelectField, SubmitButton } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Call } from '@/proposals/types';
import {
  RESPONSIBLE_ROLE_OPTIONS,
  ResponsibleRoleEnum,
  responsibleRoleLabel,
  stepDefinition,
  stepLabel,
  TRANSITION_MODE_OPTIONS,
  TransitionModeEnum,
  transitionModeDescription,
  transitionModeLabel,
} from '@/proposals/workflow/constants';
import { callWorkflowStepsKey } from '@/proposals/workflow/queries';

import { CriteriaListField } from './CriteriaListField';

interface WorkflowStepConfigProps {
  call: Call;
  step: CallWorkflowStep;
  refetch?(): void;
}

interface Props {
  resolve: WorkflowStepConfigProps;
}

interface CriterionInput {
  name: string;
  order: number;
}

interface FormValues {
  duration_in_days: number | null;
  min_reviewers: number | null;
  min_score_threshold: string | null;
  blind_review: boolean;
  requires_coi_confirmation: boolean;
  applicant_visible: boolean;
  checklist: string | null;
  responsible_role: ResponsibleRoleEnum | null;
  transition_mode: TransitionModeEnum | null;
  criteria: CriterionInput[];
  include_award_response: boolean;
}

export const WorkflowStepConfigDialog: FC<Props> = ({ resolve }) => {
  const { call, step, refetch } = resolve;
  const definition = stepDefinition(step.step);
  const showReviewExtras = step.step === 'expert_review';
  const showAllocationExtras = step.step === 'allocation_decision';

  const responsibleRoleOptions = useMemo(
    () =>
      RESPONSIBLE_ROLE_OPTIONS.map((value) => ({
        value,
        label: responsibleRoleLabel(value),
      })),
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

  const initialValues = useMemo<FormValues>(
    () => ({
      duration_in_days: step.duration_in_days ?? null,
      min_reviewers: step.min_reviewers ?? null,
      min_score_threshold: step.min_score_threshold ?? null,
      blind_review: step.blind_review ?? false,
      requires_coi_confirmation: step.requires_coi_confirmation ?? false,
      applicant_visible: step.applicant_visible ?? false,
      checklist: step.checklist ?? '',
      // Coerce SDK's BlankEnum ('') to null so the SelectField shows the placeholder.
      responsible_role: (step.responsible_role ||
        null) as ResponsibleRoleEnum | null,
      // Default to automatic_on_completion when backend returns null/BlankEnum
      // so the field always reflects an actual mode rather than an empty state.
      transition_mode: (step.transition_mode ||
        'automatic_on_completion') as TransitionModeEnum,
      criteria: (step.criteria ?? [])
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((c, index) => ({ name: c.name ?? '', order: index })),
      include_award_response: step.include_award_response ?? false,
    }),
    [step],
  );

  const submitMutation = useManagedMutation<
    unknown,
    unknown,
    PatchedCallWorkflowStepRequest
  >({
    mutationFn: (body) =>
      proposalProtectedCallsWorkflowStepsPartialUpdate({
        path: { uuid: call.uuid, obj_uuid: step.uuid },
        body,
      }),
    successMessage: translate('Workflow step configuration updated.'),
    errorMessage: translate('Unable to update workflow step configuration.'),
    refetch,
    invalidateQueries: [{ queryKey: callWorkflowStepsKey(call.uuid) }],
  });

  const onSubmit = useCallback(
    async (values: FormValues) => {
      const criteria: WorkflowCriterionRequest[] | undefined = showReviewExtras
        ? (values.criteria ?? [])
            .map((c, index) => ({
              name: (c.name ?? '').trim(),
              order: index,
            }))
            .filter((c) => c.name.length > 0)
        : undefined;
      const body: PatchedCallWorkflowStepRequest = {
        duration_in_days: values.duration_in_days || null,
        min_reviewers: values.min_reviewers || null,
        min_score_threshold: values.min_score_threshold || null,
        blind_review: values.blind_review,
        requires_coi_confirmation: values.requires_coi_confirmation,
        applicant_visible: values.applicant_visible,
        checklist: values.checklist || null,
        responsible_role: values.responsible_role || null,
        ...(criteria !== undefined ? { criteria } : {}),
        ...(showAllocationExtras
          ? { include_award_response: !!values.include_award_response }
          : {}),
        transition_mode: values.transition_mode || 'automatic_on_completion',
      };
      try {
        await submitMutation.mutateAsync(body);
      } catch {
        return { [FORM_ERROR]: translate('Unable to save changes.') };
      }
    },
    [showReviewExtras, showAllocationExtras, submitMutation],
  );

  return (
    <Form<FormValues>
      onSubmit={onSubmit}
      initialValues={initialValues}
      mutators={{ ...arrayMutators }}
      render={({ handleSubmit, submitting, pristine }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              showReviewExtras
                ? translate('Configure criteria for {name}', {
                    name: stepLabel(step.step),
                  })
                : translate('Configure step: {name}', {
                    name: stepLabel(step.step),
                  })
            }
            closeButton
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  disabled={pristine}
                  disabledReason={
                    pristine
                      ? translate('Change a value to enable saving.')
                      : undefined
                  }
                  submitting={submitting}
                  label={translate('Save')}
                  className="min-w-125px"
                />
              </>
            }
          >
            {definition && (
              <p className="text-muted mb-4">{definition.description}</p>
            )}

            <FormGroup
              label={translate('Estimated duration (days)')}
              description={translate(
                'Days allowed for this step. Used to compute the deadline.',
              )}
            >
              <Field
                name="duration_in_days"
                component={NumberField as any}
                min={0}
              />
            </FormGroup>

            <FormGroup label={translate('Responsible role')} required>
              <Field
                name="responsible_role"
                component={SelectField as any}
                options={responsibleRoleOptions}
                simpleValue
                placeholder={translate('Select...')}
                validate={required}
              />
            </FormGroup>

            <FormGroup label={translate('Transition mode options')} required>
              <Field
                name="transition_mode"
                component={AwesomeRadioButton as any}
                choices={transitionModeChoices}
                gap={3}
                validate={required}
              />
            </FormGroup>

            {showReviewExtras && (
              <>
                <div className="row">
                  <div className="col-sm-6">
                    <FormGroup
                      label={translate('Minimum reviewers')}
                      description={translate(
                        'Minimum reviews required before this step can complete.',
                      )}
                    >
                      <Field
                        name="min_reviewers"
                        component={NumberField as any}
                        min={1}
                      />
                    </FormGroup>
                  </div>
                  <div className="col-sm-6">
                    <FormGroup
                      label={translate('Minimum score threshold')}
                      description={translate(
                        'Minimum average score to pass this step.',
                      )}
                    >
                      <Field
                        name="min_score_threshold"
                        component={NumberField as any}
                        min={0}
                        step={0.1}
                      />
                    </FormGroup>
                  </div>
                </div>

                <FormGroup label={translate('Criteria')}>
                  <CriteriaListField name="criteria" />
                </FormGroup>

                <FormGroup spaceless>
                  <Field
                    name="blind_review"
                    type="checkbox"
                    component={AwesomeCheckboxField as any}
                    label={translate('Blind review')}
                    help_text={translate(
                      "Evaluators cannot see each other's assessments.",
                    )}
                  />
                </FormGroup>

                <FormGroup spaceless>
                  <Field
                    name="requires_coi_confirmation"
                    type="checkbox"
                    component={AwesomeCheckboxField as any}
                    label={translate('Conflict of interest confirmation')}
                    help_text={translate(
                      'Evaluator must confirm absence of conflict of interest.',
                    )}
                  />
                </FormGroup>
              </>
            )}

            {showAllocationExtras && (
              <FormGroup spaceless>
                <Field
                  name="include_award_response"
                  type="checkbox"
                  component={AwesomeCheckboxField as any}
                  label={translate('Include award response')}
                  help_text={translate(
                    'Require the applicant to explicitly accept or decline the award before provisioning.',
                  )}
                />
              </FormGroup>
            )}

            <FormGroup spaceless>
              <Field
                name="applicant_visible"
                type="checkbox"
                component={AwesomeCheckboxField as any}
                label={translate('Applicant visible')}
                help_text={translate(
                  'Applicants can see step details, not just status.',
                )}
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    />
  );
};
