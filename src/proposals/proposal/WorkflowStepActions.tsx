import {
  ArrowCounterClockwiseIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  NotePencilIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import {
  ProposalWorkflowStepInstance,
  proposalProposalsAdvanceWorkflowStep,
  proposalProposalsCancelChangeRequest,
  proposalProposalsRejectWorkflowStep,
} from 'waldur-js-client';

import { AlertItem, BaseButton } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { Panel } from '@/core/Panel';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useUser } from '@/workspace/hooks';

import { Proposal } from '../types';
import { CompleteWorkflowStepDialog } from '../workflow/CompleteWorkflowStepDialog';
import {
  fetchProposalWorkflowStates,
  proposalWorkflowStatesKey,
} from '../workflow/queries';
import { ReopenDecisionDialog } from '../workflow/ReopenDecisionDialog';
import { RequestChangesDialog } from '../workflow/RequestChangesDialog';
import { ScoreGateAlert } from '../workflow/ScoreGate';
import { activeStepsOf } from '../workflow/stages';

import { changeRequestPartLabel, getStepChangeRequest } from './changeRequests';
import { proposalRunsKey } from './postAwardQueries';
import { STEP_ACTIONS_SECTION_ID, stepActionAccess } from './stepActions';

/**
 * Whether the viewer completes a step without managing the call: they hold
 * its completer's call role (a panel member on an assignment step, say) or
 * the evaluator role that completes it. The backend checks again.
 */
type CompletesStep =
  boolean | ((step: ProposalWorkflowStepInstance) => boolean);

interface WorkflowStepActionsProps {
  proposal: Proposal;
  refetch: () => void;
  /**
   * Whether the viewer completes an active step without managing the call,
   * for every active step alike or decided per step.
   */
  completesActiveStep?: CompletesStep;
}

// Call-manager controls for driving the per-proposal workflow engine. The call
// manager drives progression and may complete/reject any NON-applicant step
// (the backend's review/score gates remain the guardrail); reviewers/panel/
// offering managers feed content from their own surfaces, and award_response is
// completed by the applicant on their own view. The backend
// (can_act_on_active_workflow_step) is the authority; this only decides what to
// surface.
//
// Steps of one stage run at the same time: each active step gets its own
// card, and every action names the step it is about, so acting on one never
// touches the other.
export const WorkflowStepActions: FC<WorkflowStepActionsProps> = ({
  proposal,
  refetch,
  completesActiveStep,
}) => {
  const { data } = useQuery({
    queryKey: proposalWorkflowStatesKey(proposal.uuid),
    queryFn: () => fetchProposalWorkflowStates(proposal.uuid),
  });

  const activeSteps = useMemo(() => activeStepsOf(data), [data]);
  const completes = (step: ProposalWorkflowStepInstance) =>
    typeof completesActiveStep === 'function'
      ? completesActiveStep(step)
      : !!completesActiveStep;

  // Parked for a manual advance, or a held decision, there is no active
  // step; the proposal's own actions still need a card.
  if (!activeSteps.length) {
    return <StepActionsCard proposal={proposal} refetch={refetch} first />;
  }
  return (
    <>
      {activeSteps.map((step, index) => (
        <StepActionsCard
          key={step.uuid}
          proposal={proposal}
          refetch={refetch}
          activeStep={step}
          completesActiveStep={completes(step)}
          first={index === 0}
        />
      ))}
    </>
  );
};

interface StepActionsCardProps {
  proposal: Proposal;
  refetch: () => void;
  activeStep?: ProposalWorkflowStepInstance;
  completesActiveStep?: boolean;
  /** The first card carries the proposal's own actions and the section id. */
  first: boolean;
}

const StepActionsCard: FC<StepActionsCardProps> = ({
  proposal,
  refetch,
  activeStep,
  completesActiveStep,
  first,
}) => {
  const user = useUser();
  const { openDialog } = useModal();

  const {
    awaitingManualAdvance,
    canManage,
    canReopenDecision,
    canActOnActiveStep,
    evaluatorCompletes,
    shown,
  } = stepActionAccess({
    user,
    proposal,
    activeStep,
    completesActiveStep,
    withProposalActions: first,
  });

  // Completion is gated by the step's required checklist (enforced backend-side
  // in _enforce_step_gates). Reflect that in the button so the manager sees why
  // it is blocked, instead of clicking and getting a server error.
  const completeBlockedByChecklist =
    !!activeStep?.checklist_status?.checklist_required &&
    (activeStep.checklist_status.unanswered_required_count ?? 0) > 0;

  const advanceStep = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProposalsAdvanceWorkflowStep({ path: { uuid: proposal.uuid } }),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate('Advance the proposal to the next workflow step?'),
    },
    successMessage: translate('Workflow advanced.'),
    errorMessage: translate('Unable to advance the workflow.'),
    invalidateQueries: [
      { queryKey: proposalWorkflowStatesKey(proposal.uuid) },
      { queryKey: proposalRunsKey(proposal.uuid) },
    ],
  });

  const rejectStep = useManagedMutation<any, any, { input: string }>({
    mutationFn: (variables) =>
      proposalProposalsRejectWorkflowStep({
        path: { uuid: proposal.uuid },
        body: { step_uuid: activeStep!.uuid, reason: variables.input },
      }),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate('Reject the proposal at the current step?'),
      options: {
        showInput: true,
        inputLabel: translate('Rejection reason'),
        inputPlaceholder: translate('Enter reason for rejection'),
        inputRequired: true,
      },
    },
    successMessage: translate('Proposal rejected.'),
    errorMessage: translate('Unable to reject the proposal.'),
    invalidateQueries: [
      { queryKey: proposalWorkflowStatesKey(proposal.uuid) },
      { queryKey: proposalRunsKey(proposal.uuid) },
    ],
  });

  // The step waits on the applicant's changes: it is neither completed nor
  // rejected meanwhile, and the request is cancelled first. Only its own
  // request holds it: a step running beside it is decided as usual, and may
  // ask for changes of its own, which the applicant answers together.
  const openRequest = getStepChangeRequest(proposal, activeStep);
  const actsOnStep =
    evaluatorCompletes || (!!canManage && !!canActOnActiveStep);
  const canRequestChanges =
    actsOnStep && !!activeStep?.allows_change_requests && !openRequest;

  const cancelRequest = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProposalsCancelChangeRequest({
        path: { uuid: proposal.uuid },
        body: { change_request_uuid: openRequest!.uuid },
      }),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Cancel the request for changes? The parts unlocked are locked again and the step is yours to decide.',
      ),
    },
    successMessage: translate('The request for changes has been canceled.'),
    errorMessage: translate('Unable to cancel the request for changes.'),
    invalidateQueries: [{ queryKey: proposalWorkflowStatesKey(proposal.uuid) }],
  });

  if (!shown) return null;

  // A step run once per round is never completed on one proposal.
  const roundScoped = !!activeStep?.round_scoped;

  const completeButton = (
    <BaseButton
      variant="primary"
      disabled={completeBlockedByChecklist}
      disabledReason={
        completeBlockedByChecklist
          ? (activeStep?.contributor_source ?? 'none') !== 'none'
            ? // Its form is filled on the contributions, by those who
              // contribute: nothing to answer here.
              translate(
                'The required questions are answered on the step’s contributions, by those who contribute to it.',
              )
            : translate(
                'Answer the required checklist questions before completing this step.',
              )
          : undefined
      }
      onClick={() =>
        openDialog(CompleteWorkflowStepDialog, {
          resolve: { proposal, step: activeStep, refetch },
        })
      }
      className="w-full mt-1.5"
      iconNode={<CheckCircleIcon weight="bold" />}
      label={translate('Complete step')}
      size="lg"
    />
  );

  // Every contribution is in and the gates are met: the step waits for the
  // viewer alone. Completing may carry a decision, so it is never done for
  // them; they are told it is their turn.
  const readyToComplete =
    !!activeStep?.ready_to_complete &&
    (evaluatorCompletes || (!!canManage && !!canActOnActiveStep));

  // Why the step stands still and what moves it, for those overseeing it.
  const waitingFor =
    canManage && !readyToComplete
      ? activeStep?.waiting_for || activeStep?.awaiting_lead
      : undefined;

  // A request still open is withdrawn here: small, as an aside to it.
  const cancelRequestButton = (
    <BaseButton
      variant="tertiary"
      onClick={() => cancelRequest.mutate()}
      pending={cancelRequest.isPending}
      iconNode={<XCircleIcon weight="bold" />}
      label={translate('Cancel request for changes')}
      size="sm"
      // Its label wraps: unwrapped, it is wider than the sidebar's notice.
      className="h-auto max-w-full whitespace-normal text-start"
    />
  );

  return (
    <Panel
      id={first ? STEP_ACTIONS_SECTION_ID : undefined}
      title={translate('Current step')}
      subtitle={activeStep?.step_name}
      cardBordered
      className="mb-4"
    >
      {waitingFor && (
        <AlertItem
          variant="warning"
          className="mb-1.5"
          title={translate('The step cannot move on yet')}
          body={waitingFor}
          data-testid="step-waiting-for"
        />
      )}
      {(canManage || evaluatorCompletes) && (
        <ScoreGateAlert gate={activeStep?.score_gate} className="mb-1.5" />
      )}
      {readyToComplete && (
        <AlertItem
          variant="success"
          className="mb-1.5"
          title={translate('All contributions are in — complete the step.')}
          data-testid="step-ready-to-complete"
        />
      )}
      {canReopenDecision && (
        <BaseButton
          variant="tertiary"
          onClick={() =>
            openDialog(ReopenDecisionDialog, {
              resolve: { proposal, refetch },
            })
          }
          className="w-full mt-1.5"
          iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
          label={translate('Reopen decision')}
          size="lg"
        />
      )}
      {canManage && awaitingManualAdvance && (
        <BaseButton
          variant="primary"
          onClick={() => advanceStep.mutate()}
          pending={advanceStep.isPending}
          className="w-full mt-1.5"
          iconNode={<ArrowRightIcon weight="bold" />}
          label={translate('Advance workflow')}
          size="lg"
        />
      )}
      {openRequest && actsOnStep && (
        <AlertItem
          variant="info"
          className="mb-1.5"
          title={translate("Waiting for the applicant's changes")}
          body={
            <>
              <p className="mb-1 whitespace-pre-wrap">{openRequest.message}</p>
              <p className="mb-1">
                {translate('Unlocked: {parts}.', {
                  parts: openRequest.unlocked_parts
                    .map(changeRequestPartLabel)
                    .join(', '),
                })}
              </p>
              {openRequest.due_at && (
                <p className="mb-0">
                  {translate('Due {date}.', {
                    date: formatDateTime(openRequest.due_at),
                  })}
                </p>
              )}
              {/* Under the request, not beside it: the sidebar is narrow. */}
              {canManage && <div className="mt-2.5">{cancelRequestButton}</div>}
            </>
          }
          data-testid="changes-requested"
        />
      )}
      {/* Inside the notice of the request where the viewer sees it: an
          aside to the request, not one of the step's decisions. */}
      {openRequest && canManage && !actsOnStep && (
        <div className="mt-1.5">{cancelRequestButton}</div>
      )}
      {canRequestChanges && (
        <BaseButton
          variant="tertiary"
          onClick={() =>
            openDialog(RequestChangesDialog, {
              resolve: { proposal, step: activeStep, refetch },
            })
          }
          className="w-full mt-1.5"
          iconNode={<NotePencilIcon weight="bold" />}
          label={translate('Request changes')}
          size="lg"
          data-testid="request-changes"
        />
      )}
      {roundScoped && (canManage || evaluatorCompletes) && (
        <AlertItem
          variant="info"
          className="mb-1.5"
          title={translate('Completed for the whole round')}
          body={translate(
            "This step runs once per round: it is completed by its round reports, or by the call managers for the round, from the round's row on the call's Rounds tab.",
          )}
          data-testid="step-round-scoped"
        />
      )}
      {evaluatorCompletes && !openRequest && !roundScoped && completeButton}
      {canManage && canActOnActiveStep && !openRequest && (
        <>
          {roundScoped ? null : completeButton}
          <BaseButton
            variant="danger"
            onClick={() => rejectStep.mutate()}
            className="w-full mt-1.5"
            iconNode={<XCircleIcon weight="bold" />}
            label={translate('Reject at step')}
            size="lg"
          />
        </>
      )}
    </Panel>
  );
};
