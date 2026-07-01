import { PlusCircleIcon, QuestionIcon } from '@phosphor-icons/react';
import { FORM_ERROR } from 'final-form';
import arrayMutators from 'final-form-arrays';
import { FC, useCallback, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  CallWorkflowStep,
  CallWorkflowStepRequest,
  proposalProtectedCallsWorkflowStepsSet,
  StepEnum,
  WorkflowCriterionRequest,
} from 'waldur-js-client';

import { Tip } from '@/core/Tooltip';
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
import { Call } from '@/proposals/types';
import {
  getEnabledStepIds,
  getMissingDependencies,
  getStepDefinitions,
  RESPONSIBLE_ROLE_OPTIONS,
  ResponsibleRoleEnum,
  responsibleRoleLabel,
  stepDefinition,
  TRANSITION_MODE_OPTIONS,
  TransitionModeEnum,
  transitionModeDescription,
  transitionModeLabel,
} from '@/proposals/workflow/constants';
import { callWorkflowStepsKey } from '@/proposals/workflow/queries';

import { CriteriaListField } from './CriteriaListField';

interface AddWorkflowStepProps {
  call: Call;
  configuredSteps: CallWorkflowStep[];
  refetch?(): void;
}

interface Props {
  resolve: AddWorkflowStepProps;
}

interface CriterionInput {
  name: string;
  order: number;
}

interface FormValues {
  step: StepEnum | null;
  duration_in_days: number | null;
  min_reviewers: number | null;
  checklist: string | null;
  responsible_role: ResponsibleRoleEnum | null;
  transition_mode: TransitionModeEnum | null;
  criteria: CriterionInput[];
  include_award_response: boolean;
}

// Hoisted to module scope so the reference is stable across renders. Passing
// these inline causes react-final-form to detect changed props on every render
// (shallowEqual compares `criteria: []` with `===`) and re-initialize the
// form, which wipes user input mid-typing and pins the Save button to
// disabled because `values.step` snaps back to null.
const INITIAL_VALUES: FormValues = {
  step: null,
  duration_in_days: null,
  min_reviewers: null,
  checklist: '',
  responsible_role: null,
  transition_mode: null,
  criteria: [],
  include_award_response: false,
};

const FORM_MUTATORS = { ...arrayMutators };

interface StepOption {
  value: string;
  label: string;
  description?: string;
  isDisabled?: boolean;
}

// Render each step option with a "?" tooltip carrying its catalog description.
// Only in the open menu (context "menu"), not on the selected value, to match
// the design.
const formatStepOption = (
  option: StepOption,
  meta: { context: 'menu' | 'value' },
) => (
  <div className="d-flex align-items-center justify-content-between gap-2">
    <span className={option.isDisabled ? 'text-muted' : undefined}>
      {option.label}
    </span>
    {meta.context === 'menu' && option.description && (
      // Portal to body and sit above the portaled select menu (z-index 9999),
      // otherwise the menu paints over the tooltip.
      <Tip
        id={`step-option-${option.value}`}
        label={option.description}
        placement="top"
        container={document.body}
        zIndex={10000}
      >
        <QuestionIcon weight="regular" size={16} className="text-muted" />
      </Tip>
    )}
  </div>
);

export const AddWorkflowStepDialog: FC<Props> = ({ resolve }) => {
  const { call, configuredSteps, refetch } = resolve;

  const configuredStepIds = useMemo(
    () => new Set(configuredSteps.map((s) => s.step)),
    [configuredSteps],
  );

  // Dependencies are satisfied only by *enabled* steps — a configured-but-
  // disabled dependency still fails the backend check, so gate on this set.
  const enabledStepIds = useMemo(
    () => getEnabledStepIds(configuredSteps),
    [configuredSteps],
  );

  const stepOptions = useMemo(
    () =>
      getStepDefinitions()
        // Award response is provisioned via the "Include award response"
        // toggle on Allocation decision, not by adding it directly — hide it
        // from the Add menu so the catalog has a single source of truth.
        .filter((d) => d.id !== 'award_response')
        .filter((d) => !configuredStepIds.has(d.id))
        .map((d) => {
          const missingDeps = getMissingDependencies(d.id, enabledStepIds);
          const disabled = missingDeps.length > 0;
          const labelSuffix = disabled
            ? ` (${translate('requires {step} first', {
                step: stepDefinition(missingDeps[0])?.name ?? missingDeps[0],
              })})`
            : '';
          return {
            value: d.id,
            label: d.name + labelSuffix,
            isDisabled: disabled,
            description: d.description,
          };
        }),
    [configuredStepIds, enabledStepIds],
  );

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

  const submitMutation = useManagedMutation<
    unknown,
    unknown,
    CallWorkflowStepRequest
  >({
    mutationFn: (body) =>
      proposalProtectedCallsWorkflowStepsSet({
        path: { uuid: call.uuid },
        body,
      }),
    successMessage: translate('Workflow step added.'),
    errorMessage: translate('Unable to add workflow step.'),
    refetch,
    invalidateQueries: [{ queryKey: callWorkflowStepsKey(call.uuid) }],
  });

  const onSubmit = useCallback(
    async (values: FormValues) => {
      if (!values.step) {
        return { step: translate('Required') };
      }
      const criteria: WorkflowCriterionRequest[] =
        values.step === 'expert_review'
          ? (values.criteria ?? [])
              .map((c, index) => ({
                name: (c.name ?? '').trim(),
                order: index,
              }))
              .filter((c) => c.name.length > 0)
          : [];
      const body: CallWorkflowStepRequest = {
        step: values.step,
        is_enabled: true,
        duration_in_days: values.duration_in_days || null,
        min_reviewers: values.min_reviewers || null,
        checklist: values.checklist || null,
        responsible_role: values.responsible_role || null,
        criteria,
        include_award_response:
          values.step === 'allocation_decision'
            ? !!values.include_award_response
            : false,
        transition_mode: values.transition_mode || 'automatic_on_completion',
      };
      try {
        await submitMutation.mutateAsync(body);
      } catch {
        return { [FORM_ERROR]: translate('Unable to save changes.') };
      }
    },
    [submitMutation],
  );

  return (
    <Form<FormValues>
      onSubmit={onSubmit}
      initialValues={INITIAL_VALUES}
      mutators={FORM_MUTATORS}
      render={({ handleSubmit, submitting, invalid, values }) => {
        const showExpertReviewExtras = values.step === 'expert_review';
        const showAllocationExtras = values.step === 'allocation_decision';
        const isDisabled = invalid || !values.step;
        return (
          <form onSubmit={handleSubmit}>
            <ModalDialog
              title={translate('Add step')}
              iconNode={<PlusCircleIcon weight="bold" />}
              iconColor="success"
              footer={
                <>
                  <CloseDialogButton className="min-w-125px" />
                  <SubmitButton
                    disabled={isDisabled}
                    disabledReason={
                      isDisabled
                        ? translate('Select a step and fill required fields.')
                        : undefined
                    }
                    submitting={submitting}
                    label={translate('Save')}
                    className="min-w-125px"
                  />
                </>
              }
            >
              <SelectGroup
                name="step"
                label={translate('Step')}
                required={true}
                options={stepOptions}
                simpleValue={true}
                isOptionDisabled={(o: any) => o.isDisabled}
                formatOptionLabel={formatStepOption}
                placeholder={translate('Select...')}
              />

              <div style={{ maxWidth: '18rem' }}>
                <NumberGroup
                  name="duration_in_days"
                  label={translate('Estimated duration (days)')}
                  required={true}
                  min={1}
                  placeholder="0"
                  validate={required}
                />
              </div>

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

              {showExpertReviewExtras && (
                <>
                  <div style={{ maxWidth: '18rem' }}>
                    <NumberGroup
                      name="min_reviewers"
                      label={translate('Minimal amount of reviews')}
                      required={true}
                      min={1}
                      placeholder={translate('Select...')}
                      validate={required}
                    />
                  </div>
                  <FormGroup label={translate('Criteria')}>
                    <CriteriaListField name="criteria" />
                  </FormGroup>
                </>
              )}

              {showAllocationExtras && (
                <>
                  <div className="separator my-5" />
                  <BooleanGroup
                    name="include_award_response"
                    spaceless={true}
                    label={
                      <span className="d-inline-flex align-items-center gap-2">
                        {translate('Include Award response')}
                        <Tip
                          id="include-award-response-tip"
                          label={translate(
                            'Activate this step if applicants must explicitly accept or reject the awarded resources after the allocation decision.',
                          )}
                        >
                          <QuestionIcon
                            weight="regular"
                            size={16}
                            className="text-muted"
                          />
                        </Tip>
                      </span>
                    }
                  />
                </>
              )}
            </ModalDialog>
          </form>
        );
      }}
    />
  );
};
