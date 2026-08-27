import { useQuery } from '@tanstack/react-query';
import { FORM_ERROR } from 'final-form';
import arrayMutators from 'final-form-arrays';
import { FC, useCallback, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  CallWorkflowStep,
  proposalProtectedCallsStepChecklistsList,
  PatchedCallWorkflowStepRequest,
  proposalProtectedCallsWorkflowStepsPartialUpdate,
  WorkflowCriterionRequest,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import {
  BooleanGroup,
  FormGroup,
  NumberGroup,
  RadioGroup,
  SelectGroup,
  SubmitButton,
} from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { AllocationTime, Call } from '@/proposals/types';
import { getAllocationTimeOptions } from '@/proposals/utils';
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
  checklist_required: boolean;
  responsible_role: ResponsibleRoleEnum | null;
  transition_mode: TransitionModeEnum | null;
  criteria: CriterionInput[];
  include_award_response: boolean;
  allocation_time: AllocationTime;
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

  // Use the call-manager-accessible catalogue (WORKFLOW_STEP-typed only), not
  // the staff-only checklist admin API which returns 403 for call managers.
  const { data: checklists } = useQuery({
    queryKey: ['workflowStepChecklists'],
    queryFn: () =>
      proposalProtectedCallsStepChecklistsList().then(
        (response) => response.data ?? [],
      ),
    refetchOnWindowFocus: false,
  });

  const checklistOptions = useMemo(
    () =>
      (checklists ?? []).map((c) => ({
        value: c.uuid,
        label: c.name,
      })),
    [checklists],
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
      checklist_required: step.checklist_required ?? true,
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
      allocation_time: (step.allocation_time ||
        'on_decision') as AllocationTime,
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
        checklist_required: values.checklist_required,
        responsible_role: values.responsible_role || null,
        ...(criteria !== undefined ? { criteria } : {}),
        ...(showAllocationExtras
          ? {
              include_award_response: !!values.include_award_response,
              allocation_time: values.allocation_time,
            }
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
      render={({ handleSubmit, submitting, pristine, values }) => (
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

            <NumberGroup
              name="duration_in_days"
              label={translate('Estimated duration (days)')}
              description={translate(
                'Days allowed for this step. Used to compute the deadline.',
              )}
              min={0}
            />

            <SelectGroup
              name="responsible_role"
              label={translate('Responsible role')}
              required={true}
              options={responsibleRoleOptions}
              simpleValue={true}
              placeholder={translate('Select...')}
              validate={required}
            />

            <RadioGroup
              name="transition_mode"
              label={translate('Transition mode options')}
              required={true}
              choices={transitionModeChoices}
              gap={3}
              validate={required}
            />

            {showReviewExtras && (
              <>
                <div className="row">
                  <div className="col-sm-6">
                    <NumberGroup
                      name="min_reviewers"
                      label={translate('Minimum reviewers')}
                      description={translate(
                        'Minimum reviews required before this step can complete.',
                      )}
                      min={1}
                    />
                  </div>
                  <div className="col-sm-6">
                    <NumberGroup
                      name="min_score_threshold"
                      label={translate('Minimum score threshold')}
                      description={translate(
                        'Minimum average score to pass this step.',
                      )}
                      min={0}
                      step={0.1}
                    />
                  </div>
                </div>

                <FormGroup label={translate('Criteria')}>
                  <CriteriaListField name="criteria" />
                </FormGroup>

                <BooleanGroup
                  name="blind_review"
                  spaceless={true}
                  label={translate('Blind review')}
                  help_text={translate(
                    "Evaluators cannot see each other's assessments.",
                  )}
                />

                <BooleanGroup
                  name="requires_coi_confirmation"
                  spaceless={true}
                  label={translate('Conflict of interest confirmation')}
                  help_text={translate(
                    'Evaluator must confirm absence of conflict of interest.',
                  )}
                />
              </>
            )}

            {showAllocationExtras && (
              <>
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

                <BooleanGroup
                  name="include_award_response"
                  spaceless={true}
                  label={translate('Include award response')}
                  help_text={translate(
                    'Require the applicant to explicitly accept or decline the award before provisioning.',
                  )}
                />
              </>
            )}

            <SelectGroup
              name="checklist"
              label={translate('Checklist')}
              description={translate(
                'Attach a checklist (evaluation form) for this step.',
              )}
              options={checklistOptions}
              simpleValue={true}
              isClearable={true}
              placeholder={translate('Select...')}
            />

            {values.checklist && (
              <BooleanGroup
                name="checklist_required"
                label={translate('Checklist required')}
                help_text={translate(
                  'Block completing this step until the checklist’s required questions are answered.',
                )}
              />
            )}

            <BooleanGroup
              name="applicant_visible"
              spaceless={true}
              label={translate('Applicant visible')}
              // Says what *off* does, not just what on does. Off is the
              // default and the flag is now honoured on the applicant's
              // tracker, so a call manager who reads only the on-case will not
              // realise the step is hidden from applicants until one asks.
              help_text={translate(
                'On, applicants see this step by name on their progress tracker. Off, they see only that their proposal is in review while it runs.',
              )}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
