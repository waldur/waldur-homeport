import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  proposalProtectedCallsRoundsSetWorkflowStepDueDate,
  RoundStep,
} from 'waldur-js-client';

import { DateTimeGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { toIsoDate } from './roundSteps';

interface RoundStepDueDateDialogProps {
  resolve: {
    callUuid: string;
    round: { uuid: string; name: string };
    step: RoundStep;
    refetch(): void;
  };
}

interface DueDateValues {
  due_at?: string | Date | null;
}

/**
 * Sets when a step is due in the round, for every proposal of it: the
 * proposals at the step get the new deadline at once. Left empty, the step's
 * duration counts again.
 */
export const RoundStepDueDateDialog: FC<RoundStepDueDateDialogProps> = ({
  resolve: { callUuid, round, step, refetch },
}) => {
  const save = useManagedMutation<any, any, DueDateValues>({
    mutationFn: (values) =>
      proposalProtectedCallsRoundsSetWorkflowStepDueDate({
        path: { uuid: callUuid, obj_uuid: round.uuid },
        body: { step_uuid: step.step_uuid, due_at: toIsoDate(values.due_at) },
      }),
    successMessage: translate('The due date has been saved.'),
    errorMessage: translate('Unable to save the due date.'),
    refetch,
  });

  return (
    <Form<DueDateValues>
      onSubmit={(values) => save.mutateAsync(values)}
      initialValues={{ due_at: step.due_at ?? null }}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Due date of {step} in {round}', {
              step: step.step_name,
              round: round.name,
            })}
            footer={
              <>
                <CloseDialogButton variant="tertiary" />
                <SubmitButton
                  submitting={submitting}
                  label={translate('Save')}
                />
              </>
            }
          >
            <DateTimeGroup
              name="due_at"
              label={translate('Due date')}
              minDate="today"
              description={translate(
                "The deadline of the step for every proposal of the round, whenever it reaches the step. Left empty, the step's duration counts from when it starts.",
              )}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
