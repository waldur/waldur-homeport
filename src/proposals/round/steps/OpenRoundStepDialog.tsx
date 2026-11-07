import { FC, useState } from 'react';
import { Form } from 'react-final-form';
import {
  OpenRoundWorkflowStepResponse,
  proposalProtectedCallsRoundsOpenWorkflowStep,
  RoundStep,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { required } from '@/core/validators';
import { DateTimeGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';

import { getLaggingRefusal, toIsoDate } from './roundSteps';

interface OpenRoundStepDialogProps {
  resolve: {
    callUuid: string;
    round: { uuid: string; name: string };
    step: RoundStep;
    refetch(): void;
  };
}

interface OpenFormValues {
  due_at?: string | Date | null;
  reason?: string;
}

/**
 * Opens a step run once per round for the round: the proposals waiting just
 * before it are moved in, and each of its people gets one round report and
 * one mail. Refused while proposals of the round have not reached the step;
 * the dialog then says how many and lets the manager open it anyway with a
 * reason.
 */
export const OpenRoundStepDialog: FC<OpenRoundStepDialogProps> = ({
  resolve: { callUuid, round, step, refetch },
}) => {
  const { showErrorResponse, showSuccess } = useNotify();
  const { closeDialog } = useModal();
  const [refusal, setRefusal] = useState<{
    count: number;
    detail: string;
  } | null>(null);

  const open = useManagedMutation<
    OpenRoundWorkflowStepResponse,
    any,
    OpenFormValues
  >({
    mutationFn: (values) =>
      proposalProtectedCallsRoundsOpenWorkflowStep({
        path: { uuid: callUuid, obj_uuid: round.uuid },
        body: {
          step_uuid: step.step_uuid,
          ...(values.due_at ? { due_at: toIsoDate(values.due_at) } : {}),
          ...(refusal ? { force: true, reason: values.reason } : {}),
        },
      }).then((response) => response.data),
    refetch,
    closeModal: false,
    onSuccess: (data) => {
      showSuccess(
        translate(
          '{step} is open for the round: {reports} report(s) asked for, {advanced} proposal(s) moved in.',
          {
            step: step.step_name,
            reports: data?.reports_created ?? 0,
            advanced: data?.advanced?.length ?? 0,
          },
        ),
      );
      closeDialog();
    },
    onError: (error) => {
      const lagging = !refusal && getLaggingRefusal(error);
      if (lagging) {
        setRefusal(lagging);
        return;
      }
      showErrorResponse(error, translate('Unable to open the step.'));
    },
  });

  return (
    <Form<OpenFormValues>
      onSubmit={(values) => {
        open.mutate(values);
      }}
      initialValues={{ due_at: step.due_at ?? null }}
      render={({ handleSubmit, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Open {step} for {round}', {
              step: step.step_name,
              round: round.name,
            })}
            footer={
              <>
                <CloseDialogButton variant="tertiary" />
                <SubmitButton
                  submitting={open.isPending}
                  invalid={invalid}
                  label={
                    refusal ? translate('Open anyway') : translate('Open step')
                  }
                  variant={refusal ? 'danger' : 'primary'}
                />
              </>
            }
          >
            <p>
              {step.has_reports
                ? translate(
                    "The round's proposals waiting before this step are moved into it. Each of its people is asked for one round report covering the proposals they hold it for.",
                  )
                : translate(
                    "The round's proposals waiting before this step are moved into it. The step is then completed for the whole round.",
                  )}
            </p>
            <DateTimeGroup
              name="due_at"
              label={translate('Due date')}
              minDate="today"
              description={translate(
                'When the step is due for every proposal of the round. Left empty, its duration counts from now.',
              )}
            />
            {refusal ? (
              <>
                <AlertItem
                  type="floating"
                  variant="warning"
                  title={translate(
                    '{count} proposal(s) of this round have not reached the step yet',
                    { count: refusal.count },
                  )}
                  body={translate(
                    'They join the step as they arrive. To open it now, give a reason; it is recorded on the round.',
                  )}
                  data-testid="lagging-refusal"
                />
                <TextGroup
                  name="reason"
                  label={translate('Reason for opening early')}
                  required
                  validate={required}
                  maxLength={1000}
                />
              </>
            ) : null}
          </ModalDialog>
        </form>
      )}
    />
  );
};
