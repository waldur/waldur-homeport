import { FC, useMemo, useState } from 'react';
import { Form } from 'react-final-form';
import {
  OutcomeEnum,
  proposalProposalsCompleteWorkflowStep,
  ProposalWorkflowStepInstance,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { getErrorBody } from '@/core/ErrorMessageFormatter';
import { required } from '@/core/validators';
import { BooleanGroup, SelectGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { BUDGET_QUERIES } from '@/proposals/budgets';
import { proposalRunsKey } from '@/proposals/proposal/postAwardQueries';
import { isOnProposalTeam } from '@/proposals/team/teamRules';
import { Proposal } from '@/proposals/types';
import { useNotify } from '@/store/notify';
import { useUser } from '@/workspace/hooks';

import { outcomeLabel } from './constants';
import { ProposalBudgetTable, useProposalBudget } from './ProposalBudgetPanel';
import { proposalWorkflowStatesKey } from './queries';
import { OUTCOME_ALLOWED_BELOW_THRESHOLD, ScoreGateAlert } from './ScoreGate';

interface CompleteStepFormValues {
  outcome?: OutcomeEnum;
  outcome_reason?: string;
  confirm_shortfall?: boolean;
  confirm_waiting?: boolean;
  override_budget?: boolean;
  budget_override_reason?: string;
}

/** The backend's reason for refusing a completion, when it gave one. */
const getRefusalReason = (error): string | undefined => {
  const status = error?.response?.status ?? error?.status;
  if (status !== 400) {
    return undefined;
  }
  const detail = getErrorBody(error)?.detail;
  if (Array.isArray(detail)) {
    return detail.join(' ');
  }
  return typeof detail === 'string' ? detail : undefined;
};

const requireOverrideReason = (
  value: string | undefined,
  values: CompleteStepFormValues,
) =>
  values?.override_budget && !value?.trim()
    ? translate('Give a reason for overriding the budget.')
    : undefined;

const requireReasonForApplicant = (value: string | undefined) =>
  value?.trim()
    ? undefined
    : translate('Say why you answer for the applicant.');

const confirmWithoutWork = (value: boolean | undefined) =>
  value
    ? undefined
    : translate('Confirm completing the step without that work.');

const confirmShortfall = (value: boolean | undefined) =>
  value ? undefined : translate('Confirm completing the step anyway.');

interface CompleteWorkflowStepDialogProps {
  resolve: {
    proposal: Proposal;
    step: ProposalWorkflowStepInstance;
    refetch?(): void;
  };
}

// The call manager records the outcome of the active workflow step here. The
// outcome options are the step's own outcome set, as the backend sends it;
// 'rejected' is never among them — a rejection uses the dedicated reject
// action so it can carry a required reason.
export const CompleteWorkflowStepDialog: FC<
  CompleteWorkflowStepDialogProps
> = ({ resolve }) => {
  const { proposal, step, refetch } = resolve;
  const user = useUser();
  // An applicant's step (the award response, say) answered by someone else:
  // the backend asks for a reason and tells the applicant who answered. A
  // step of that kind the call gives its own team is theirs to complete.
  const forApplicant =
    step.kind === 'applicant_action' &&
    step.completer === 'applicant' &&
    !isOnProposalTeam(user, proposal);

  // Below the score threshold the backend refuses every outcome but
  // declining; the options say so before the manager picks one.
  const belowThreshold = step.score_gate ? !step.score_gate.passes : false;
  const options = useMemo(
    () =>
      (step.allowed_outcomes ?? []).map((o) => ({
        label: outcomeLabel(o),
        value: o,
        isDisabled: belowThreshold && o !== OUTCOME_ALLOWED_BELOW_THRESHOLD,
      })),
    [step.allowed_outcomes, belowThreshold],
  );

  // Where the award stands against the call's budgets; the call team's to
  // see, so for anyone else the query is refused and nothing is shown.
  const budget = useProposalBudget(proposal.uuid, step.is_allocation_decision);
  const exceedsBudget = Boolean(
    budget.data?.entries.some((entry) => !entry.fits),
  );

  const { showErrorResponse, showSuccess } = useNotify();
  // A refused completion (too few reviews, a score below threshold, an award
  // item with no amount) says what to fix. Kept in the dialog, where the
  // manager is, rather than in a toast that disappears.
  const [refusal, setRefusal] = useState<string>();

  const completeStep = useManagedMutation<any, any, CompleteStepFormValues>({
    mutationFn: (values) =>
      proposalProposalsCompleteWorkflowStep({
        path: { uuid: proposal.uuid },
        body: {
          step_uuid: step.uuid,
          outcome: values.outcome!,
          outcome_reason: values.outcome_reason,
          ...(values.override_budget
            ? {
                override_budget: true,
                budget_override_reason: values.budget_override_reason,
              }
            : {}),
        },
      }),
    // A decision held for the round's publication says so: the applicant
    // learns of it only then, which a plain "completed" leaves unsaid.
    onSuccess: (response) =>
      showSuccess(
        response?.data?.detail || translate('Workflow step completed.'),
      ),
    onMutate: () => setRefusal(undefined),
    onError: (error) => {
      const reason = getRefusalReason(error);
      if (reason) {
        setRefusal(reason);
      } else {
        showErrorResponse(
          error,
          translate('Unable to complete the workflow step.'),
        );
      }
    },
    refetch,
    invalidateQueries: [
      { queryKey: proposalWorkflowStatesKey(proposal.uuid) },
      // The last step of an extension request or final report closes its run.
      { queryKey: proposalRunsKey(proposal.uuid) },
      // An allocation decision changes what the call's budgets have awarded.
      ...(step.is_allocation_decision ? BUDGET_QUERIES : []),
    ],
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
            {step.awaiting_lead && !refusal && (
              <AlertItem
                variant="warning"
                type="floating"
                className="mb-4"
                title={translate('The step is waiting for a lead')}
                body={step.awaiting_lead}
              />
            )}
            {step.waiting_for && !step.awaiting_lead && !refusal && (
              <AlertItem
                variant="warning"
                type="floating"
                className="mb-4"
                title={translate('The step cannot move on yet')}
                body={step.waiting_for}
              />
            )}
            {step.completion_warning && !refusal && (
              <AlertItem
                variant="warning"
                type="floating"
                className="mb-4"
                title={translate('Completing now leaves a later step short')}
                body={step.completion_warning}
                data-testid="completion-warning"
              />
            )}
            {!refusal && (
              <ScoreGateAlert gate={step.score_gate} className="mb-4" />
            )}
            {refusal && (
              <AlertItem
                variant="error"
                type="floating"
                className="mb-4"
                title={translate('The step cannot be completed yet')}
                body={refusal}
              />
            )}
            {budget.data?.entries.length ? (
              <div className="mb-4" data-testid="proposal-budget">
                <p className="font-medium mb-1.5">{translate('Call budget')}</p>
                <ProposalBudgetTable
                  proposalUuid={proposal.uuid}
                  callUuid={proposal.call_uuid}
                  budget={budget.data}
                />
              </div>
            ) : null}
            <SelectGroup
              label={translate('Outcome')}
              name="outcome"
              options={options}
              simpleValue
              required
              validate={required}
              placeholder={translate('Select an outcome...')}
            />
            {step.waiting_for && !refusal && (
              // The step's own work is not in -- nobody holds the role that
              // writes it, say: completing decides it without them, which
              // the call team may do, but on purpose.
              <BooleanGroup
                name="confirm_waiting"
                label={translate('Complete it without that work')}
                description={translate(
                  'The outcome you record stands in for the work the step is still waiting for.',
                )}
                validate={confirmWithoutWork}
              />
            )}
            {step.completion_warning && (
              <BooleanGroup
                name="confirm_shortfall"
                label={translate('Complete the step anyway')}
                description={translate(
                  'Reviewers can still be assigned once the review step has started.',
                )}
                validate={confirmShortfall}
              />
            )}
            {exceedsBudget &&
              // The server lets only staff past a strictly enforced budget:
              // anyone else is told so instead of offered a box it refuses.
              (budget.data.budget_enforcement === 'hard' && !user?.is_staff ? (
                <AlertItem
                  variant="warning"
                  type="floating"
                  className="mb-4"
                  title={translate('The award exceeds the budget')}
                  body={translate(
                    'The award exceeds what remains. The call enforces its budget strictly: only staff may override it. Lower the award, or ask staff to approve it.',
                  )}
                />
              ) : (
                <>
                  <BooleanGroup
                    name="override_budget"
                    label={translate('Override the budget')}
                    description={
                      budget.data.budget_enforcement === 'hard'
                        ? translate(
                            'The award exceeds what remains. The call enforces its budget strictly: only staff may override it.',
                          )
                        : translate(
                            'The award exceeds what remains. Approve it anyway, with a reason recorded on the proposal.',
                          )
                    }
                  />
                  <TextGroup
                    name="budget_override_reason"
                    maxLength={1000}
                    label={translate('Reason for overriding the budget')}
                    validate={requireOverrideReason}
                  />
                </>
              ))}
            {forApplicant ? (
              <>
                <AlertItem
                  variant="warning"
                  type="floating"
                  className="mb-4"
                  title={translate('You answer for the applicant')}
                  body={translate(
                    "This step is the applicant's to answer. The applicant is told that you answered it on their behalf, with your name and your reason.",
                  )}
                  data-testid="answer-for-applicant"
                />
                <TextGroup
                  name="outcome_reason"
                  maxLength={1000}
                  label={translate('Why you answer for the applicant')}
                  required
                  validate={requireReasonForApplicant}
                />
              </>
            ) : (
              <TextGroup
                name="outcome_reason"
                maxLength={1000}
                label={translate('Comment')}
                placeholder={translate('Optional explanation for the outcome')}
              />
            )}
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
