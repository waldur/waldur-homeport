import { useQueryClient } from '@tanstack/react-query';
import arrayMutators from 'final-form-arrays';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Form, FormRenderProps } from 'react-final-form';
import {
  CallWorkflowStep,
  PatchedCallWorkflowStepRequest,
  proposalProtectedCallsWorkflowStepsPartialUpdate,
  StepKind,
} from 'waldur-js-client';

import { AlertItem, BaseButton } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Call } from '@/proposals/types';
import { findKind, stepName } from '@/proposals/workflow/constants';
import {
  callWorkflowStepsKey,
  useWorkflowStepKinds,
} from '@/proposals/workflow/queries';
import {
  callWorkflowCheckKey,
  callWorkflowDescriptionKey,
  callWorkflowHistoryKey,
} from '@/proposals/workflow-description/queries';
import { useNotify } from '@/store/notify';

import { StepCheckPage } from './StepCheckPage';
import {
  allocationDecisionLockedReason,
  buildStepBody,
  fieldFormName,
  StepFormPage,
  stepFormPages,
  StepFormValues,
  stepFormValues,
  stepSubmissionErrors,
} from './stepForm';
import {
  StepFormBackButton,
  StepFormNextButton,
  StepFormPageIndicator,
  submitShowingErrors,
  useStepFormPage,
} from './StepFormWizard';
import { WorkflowStepFormFields } from './WorkflowStepFormFields';

interface Props {
  resolve: {
    call: Call;
    step: CallWorkflowStep;
    refetch?(): void;
    /** The page the dialog opens on, such as the one holding a field. */
    initialPage?: StepFormPage;
    /** A field to focus on that page: the one a check finding names. */
    initialField?: string;
  };
}

const FORM_MUTATORS = { ...arrayMutators };

interface StepConfigFormProps {
  kind: StepKind | undefined;
  call: Call;
  step: CallWorkflowStep;
  isLoading: boolean;
  showEnableSwitch: boolean;
  initialPage?: StepFormPage;
  initialField?: string;
}

/**
 * Focus the control of ``field`` once the dialog shows it, and bring it into
 * view: a check finding opens the dialog on the field that fixes it.
 */
const useFocusField = (field: string | undefined) => {
  useEffect(() => {
    if (!field) return;
    const name = fieldFormName(field);
    const timer = window.setTimeout(() => {
      const target = document.querySelector<HTMLElement>(
        `.step-form-dialog-body [name="${name}"]`,
      );
      if (!target) return;
      const control = target.matches(
        'input:not([type="hidden"]), select, textarea',
      )
        ? target
        : target.parentElement?.querySelector<HTMLElement>(
            'input:not([type="hidden"]), select, textarea, button',
          );
      (control ?? target).scrollIntoView?.({ block: 'center' });
      (control ?? target).focus?.();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [field]);
};

/**
 * The step's settings a page at a time. Save is on every page: a call
 * manager often comes to change one field.
 */
const StepConfigForm: FC<
  FormRenderProps<StepFormValues> & StepConfigFormProps
> = ({
  handleSubmit,
  form,
  submitting,
  pristine,
  values,
  submitError,
  dirtySinceLastSubmit,
  kind,
  call,
  step,
  isLoading,
  showEnableSwitch,
  initialPage,
  initialField,
}) => {
  useFocusField(isLoading ? undefined : initialField);
  const pages = stepFormPages(kind, values, {
    showEnableSwitch,
    withCheck: true,
  });
  const { page, setPage, isFirst, isLast, goBack, goNext } = useStepFormPage(
    pages,
    initialPage,
  );
  // A page opened from the Check page's Change link goes back to it.
  const [returnToCheck, setReturnToCheck] = useState(false);
  const selectPage = useCallback(
    (next: StepFormPage) => {
      setReturnToCheck(false);
      setPage(next);
    },
    [setPage],
  );
  return (
    <form
      onSubmit={(event) =>
        submitShowingErrors(event, handleSubmit, form, pages, setPage)
      }
    >
      <ModalDialog
        title={translate('Configure step: {name}', {
          name: stepName(step),
        })}
        subtitle={kind?.name}
        extra={
          <StepFormPageIndicator
            pages={pages}
            page={page}
            onSelect={selectPage}
          />
        }
        extraClassName="py-0"
        bodyClassName="step-form-dialog-body"
        footer={
          <>
            <StepFormBackButton isFirst={isFirst} goBack={goBack} />
            <CloseDialogButton />
            {returnToCheck && page !== 'check' ? (
              <BaseButton
                variant="secondary"
                size="lg"
                className="min-w-dialog-action"
                label={translate('Back to check')}
                onClick={() => selectPage('check')}
              />
            ) : (
              <StepFormNextButton isLast={isLast} goNext={goNext} />
            )}
            <SubmitButton
              disabled={pristine}
              disabledReason={
                pristine
                  ? translate('Change a value to enable saving.')
                  : undefined
              }
              submitting={submitting}
              label={translate('Save')}
            />
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
            {page === 'check' && (
              <StepCheckPage
                pages={pages}
                kind={kind}
                values={values}
                callUuid={call.uuid}
                step={step}
                showEnableSwitch={showEnableSwitch}
                onChange={(target) => {
                  setPage(target);
                  setReturnToCheck(true);
                }}
              />
            )}
            <WorkflowStepFormFields
              kind={kind}
              values={values}
              pages={pages}
              page={page}
              callUuid={call.uuid}
              reviewsHiddenFromApplicants={!call.reviews_visible_to_submitters}
              customerUuid={call.customer_uuid}
              step={step}
              showEnableSwitch={showEnableSwitch}
              allocationDecisionLockedReason={allocationDecisionLockedReason(
                call,
              )}
            />
          </>
        )}
      </ModalDialog>
    </form>
  );
};

/**
 * Configures one call step: its name, and the fields its kind is configured
 * with. The kind itself is fixed once the step exists.
 */
export const WorkflowStepConfigDialog: FC<Props> = ({ resolve }) => {
  const { call, step, refetch, initialPage, initialField } = resolve;
  const { data: kinds, isLoading } = useWorkflowStepKinds();
  const kind = findKind(kinds, step.kind);
  const { showErrorResponse } = useNotify();
  // The allocation decision always runs and the backend refuses to disable
  // it, so it gets no switch -- the padlock on its row says as much.
  const showEnableSwitch = !step.is_mandatory;

  const initialValues = useMemo(() => stepFormValues(step), [step]);

  const queryClient = useQueryClient();

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
    refetch,
    invalidateQueries: [
      { queryKey: callWorkflowStepsKey(call.uuid) },
      { queryKey: callWorkflowDescriptionKey(call.uuid) },
      { queryKey: callWorkflowCheckKey(call.uuid) },
      { queryKey: callWorkflowHistoryKey(call.uuid) },
    ],
  });

  const onSubmit = useCallback(
    async (values: StepFormValues) => {
      const body: PatchedCallWorkflowStepRequest = {
        ...buildStepBody(values, kind),
        // Only when the user actually moved the switch, so saving an
        // unrelated field never re-enables a step somebody else has since
        // turned off.
        ...(values.is_enabled !== step.is_enabled
          ? { is_enabled: values.is_enabled }
          : {}),
      };
      try {
        await submitMutation.mutateAsync(body);
      } catch (error) {
        // Pull the table back in line with the backend whatever happened.
        queryClient.invalidateQueries({
          queryKey: callWorkflowStepsKey(call.uuid),
        });
        const errors = stepSubmissionErrors(error);
        if (errors) return errors;
        showErrorResponse(
          error,
          translate('Unable to update workflow step configuration.'),
        );
      }
    },
    [kind, step, submitMutation, queryClient, call.uuid, showErrorResponse],
  );

  return (
    <Form<StepFormValues>
      onSubmit={onSubmit}
      initialValues={initialValues}
      mutators={FORM_MUTATORS}
      render={(formProps) => (
        <StepConfigForm
          {...formProps}
          kind={kind}
          call={call}
          step={step}
          isLoading={isLoading}
          showEnableSwitch={showEnableSwitch}
          initialPage={initialPage}
          initialField={initialField}
        />
      )}
    />
  );
};
