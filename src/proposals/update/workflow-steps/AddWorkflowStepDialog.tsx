import { PlusCircleIcon, QuestionIcon } from '@phosphor-icons/react';
import arrayMutators from 'final-form-arrays';
import { FC, useCallback, useMemo } from 'react';
import { Form, FormRenderProps } from 'react-final-form';
import {
  CallWorkflowStep,
  CallWorkflowStepRequest,
  proposalProtectedCallsWorkflowStepsSet,
  StepKind,
} from 'waldur-js-client';

import { AlertItem, Tooltip } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { SelectGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Call } from '@/proposals/types';
import { findKind } from '@/proposals/workflow/constants';
import {
  callWorkflowStepsKey,
  useWorkflowStepKinds,
} from '@/proposals/workflow/queries';
import { useNotify } from '@/store/notify';

import { useConfirmPathChange } from './pathChangeImpact';
import {
  allocationDecisionLockedReason,
  buildStepBody,
  EMPTY_STEP_VALUES,
  stepFormPages,
  StepFormValues,
  stepSubmissionErrors,
} from './stepForm';
import {
  StepFormBackButton,
  StepFormNextButton,
  StepFormPageIndicator,
  submitShowingErrors,
  useStepFormPage,
} from './StepFormWizard';
import {
  ApplyKindDefaults,
  WorkflowStepFormFields,
} from './WorkflowStepFormFields';

interface Props {
  resolve: {
    call: Call;
    // Every step of the call, in workflow order.
    steps?: CallWorkflowStep[];
    refetch?(): void;
  };
}

const FORM_MUTATORS = { ...arrayMutators };

// Stands for the step being added in the before/after sequences.
const NEW_STEP_UUID = 'new-step';

interface KindOption {
  value: string;
  label: string;
  description?: string;
}

// Each kind with a "?" carrying its description, in the open menu only.
const formatKindOption = (
  option: KindOption,
  meta: { context: 'menu' | 'value' },
) => (
  <div className="flex items-center justify-between gap-1.5">
    <span>{option.label}</span>
    {meta.context === 'menu' && option.description && (
      // Portal to body and sit above the portaled select menu (z-index 9999),
      // otherwise the menu paints over the tooltip.
      <Tooltip label={option.description} side="top" zIndex={10000}>
        <QuestionIcon weight="regular" size={16} className="text-quaternary" />
      </Tooltip>
    )}
  </div>
);

interface AddStepFormProps {
  kinds: StepKind[] | undefined;
  kindOptions: KindOption[];
  call: Call;
  isLoading: boolean;
}

/**
 * The kind first, then the step's settings a page at a time; the step is
 * created from the last page.
 */
const AddStepForm: FC<FormRenderProps<StepFormValues> & AddStepFormProps> = ({
  handleSubmit,
  form,
  submitting,
  values,
  submitError,
  dirtySinceLastSubmit,
  kinds,
  kindOptions,
  call,
  isLoading,
}) => {
  const kind = findKind(kinds, values.kind);
  const pages = stepFormPages(kind, values);
  const { page, setPage, isFirst, isLast, goBack, goNext } =
    useStepFormPage(pages);
  return (
    <form
      onSubmit={(event) =>
        submitShowingErrors(event, handleSubmit, form, pages, setPage)
      }
    >
      <ModalDialog
        title={translate('Add step')}
        iconNode={<PlusCircleIcon weight="bold" />}
        iconColor="success"
        extra={
          <StepFormPageIndicator pages={pages} page={page} onSelect={setPage} />
        }
        extraClassName="py-0"
        bodyClassName="step-form-dialog-body"
        footer={
          <>
            <StepFormBackButton isFirst={isFirst} goBack={goBack} />
            <CloseDialogButton />
            <StepFormNextButton
              isLast={isLast && Boolean(kind)}
              goNext={goNext}
              variant="primary"
              disabledReason={
                kind ? undefined : translate('Select a kind first.')
              }
            />
            {kind && isLast && (
              // Not held back while a field is wrong: saving shows the page
              // with the wrong field, which a disabled button would not.
              <SubmitButton
                submitting={submitting}
                label={translate('Create')}
              />
            )}
          </>
        }
      >
        {submitError && !dirtySinceLastSubmit && (
          <AlertItem variant="error" title={submitError} className="mb-3" />
        )}
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <WorkflowStepFormFields
              kind={kind}
              values={values}
              pages={pages}
              page={page}
              kindField={
                <SelectGroup
                  name="kind"
                  label={translate('Kind')}
                  description={translate(
                    'What the step does. A call may run several steps of the same kind.',
                  )}
                  required={true}
                  options={kindOptions}
                  simpleValue={true}
                  formatOptionLabel={formatKindOption}
                  placeholder={translate('Select...')}
                  validate={required}
                />
              }
              callUuid={call.uuid}
              reviewsHiddenFromApplicants={!call.reviews_visible_to_submitters}
              customerUuid={call.customer_uuid}
              allocationDecisionLockedReason={allocationDecisionLockedReason(
                call,
              )}
            />
            <ApplyKindDefaults kind={kind} values={values} />
          </>
        )}
      </ModalDialog>
    </form>
  );
};

/**
 * Adds a step of a kind to the call's workflow, at the end; the row actions
 * move it into place. A kind may be added any number of times -- a second
 * assessment, a further applicant action -- each with its own name.
 */
export const AddWorkflowStepDialog: FC<Props> = ({ resolve }) => {
  const { call, steps = [], refetch } = resolve;
  const confirmPathChange = useConfirmPathChange(call);
  const { data: kinds, isLoading } = useWorkflowStepKinds();
  const { showErrorResponse } = useNotify();

  const kindOptions = useMemo<KindOption[]>(
    () =>
      (kinds ?? []).map((kind: StepKind) => ({
        value: kind.id,
        label: kind.name,
        description: kind.description,
      })),
    [kinds],
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
    refetch,
    invalidateQueries: [{ queryKey: callWorkflowStepsKey(call.uuid) }],
  });

  const onSubmit = useCallback(
    async (values: StepFormValues) => {
      const kind = findKind(kinds, values.kind);
      if (!kind) {
        return { kind: translate('Required') };
      }
      const body: CallWorkflowStepRequest = {
        ...buildStepBody(values, kind),
        kind: kind.id,
        is_enabled: true,
      };
      // The new step joins the end of the path of proposals submitted from
      // now on; cancelling keeps the dialog and its values.
      const lastOrder = steps.reduce((max, s) => Math.max(max, s.order), -1);
      const confirmed = await confirmPathChange({
        kind: 'steps',
        before: steps,
        after: [
          ...steps,
          {
            uuid: NEW_STEP_UUID,
            order: lastOrder + 1,
            is_enabled: true,
            name: body.name || kind.name,
          },
        ],
        changedUuid: NEW_STEP_UUID,
      });
      if (!confirmed) return;
      try {
        await submitMutation.mutateAsync(body);
      } catch (error) {
        const errors = stepSubmissionErrors(error);
        if (errors) return errors;
        showErrorResponse(error, translate('Unable to add workflow step.'));
      }
    },
    [kinds, submitMutation, showErrorResponse, steps, confirmPathChange],
  );

  return (
    <Form<StepFormValues>
      onSubmit={onSubmit}
      initialValues={EMPTY_STEP_VALUES}
      mutators={FORM_MUTATORS}
      render={(formProps) => (
        <AddStepForm
          {...formProps}
          kinds={kinds}
          kindOptions={kindOptions}
          call={call}
          isLoading={isLoading}
        />
      )}
    />
  );
};
