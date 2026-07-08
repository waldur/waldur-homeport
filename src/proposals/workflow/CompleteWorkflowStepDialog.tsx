import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  OutcomeEnum,
  proposalProposalsCompleteWorkflowStep,
  ProposalWorkflowStepInstance,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { SelectGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Proposal } from '@/proposals/types';

import { getStepDefinitions, outcomeLabel } from './constants';
import { proposalWorkflowStatesKey } from './queries';

interface CompleteStepFormValues {
  outcome?: OutcomeEnum;
  outcome_reason?: string;
}

interface CompleteWorkflowStepDialogProps {
  resolve: {
    proposal: Proposal;
    step: ProposalWorkflowStepInstance;
    refetch?(): void;
  };
}

// The call manager records the outcome of the active workflow step here. The
// outcome options are the step's own allow-list (mirrored from the backend
// WorkflowStepOutcomes.STEP_ALLOW_LIST); 'rejected' is deliberately absent — a
// rejection uses the dedicated reject action so it can carry a required reason.
export const CompleteWorkflowStepDialog: FC<
  CompleteWorkflowStepDialogProps
> = ({ resolve }) => {
  const { proposal, step, refetch } = resolve;

  const options = useMemo(() => {
    const def = getStepDefinitions().find((d) => d.id === step.step);
    return (def?.allowedOutcomes ?? []).map((o) => ({
      label: outcomeLabel(o),
      value: o,
    }));
  }, [step.step]);

  const completeStep = useManagedMutation<any, any, CompleteStepFormValues>({
    mutationFn: (values) =>
      proposalProposalsCompleteWorkflowStep({
        path: { uuid: proposal.uuid },
        body: {
          step_uuid: step.uuid,
          outcome: values.outcome!,
          outcome_reason: values.outcome_reason,
        },
      }),
    successMessage: translate('Workflow step completed.'),
    errorMessage: translate('Unable to complete the workflow step.'),
    refetch,
    invalidateQueries: [{ queryKey: proposalWorkflowStatesKey(proposal.uuid) }],
  });

  return (
    <Form<CompleteStepFormValues>
      onSubmit={(values) => completeStep.mutate(values)}
    >
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Complete step: {name}', {
              name: step.step_name,
            })}
            footer={
              <>
                <CloseDialogButton variant="tertiary" />
                <SubmitButton
                  submitting={completeStep.isPending}
                  label={translate('Complete step')}
                />
              </>
            }
          >
            <SelectGroup
              label={translate('Outcome')}
              name="outcome"
              options={options}
              simpleValue
              required
              validate={required}
              placeholder={translate('Select an outcome...')}
            />
            <TextGroup
              name="outcome_reason"
              maxLength={1000}
              label={translate('Comment')}
              placeholder={translate('Optional explanation for the outcome')}
            />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
