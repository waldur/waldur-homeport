import {
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import {
  proposalProposalsAdvanceWorkflowStep,
  proposalProposalsRejectWorkflowStep,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionButton } from '@/table/ActionButton';
import { useUser } from '@/workspace/hooks';

import { Proposal } from '../types';
import { CompleteWorkflowStepDialog } from '../workflow/CompleteWorkflowStepDialog';
import {
  fetchProposalWorkflowStates,
  proposalWorkflowStatesKey,
} from '../workflow/queries';

interface WorkflowStepActionsProps {
  proposal: Proposal;
  refetch: () => void;
}

// Call-manager controls for driving the per-proposal workflow engine. The call
// manager drives progression and may complete/reject any NON-applicant step
// (the backend's review/score gates remain the guardrail); reviewers/panel/
// offering managers feed content from their own surfaces, and award_response is
// completed by the applicant on their own view. The backend
// (can_act_on_active_workflow_step) is the authority; this only decides what to
// surface.
export const WorkflowStepActions: FC<WorkflowStepActionsProps> = ({
  proposal,
  refetch,
}) => {
  const user = useUser();
  const { openDialog } = useModal();

  const { data } = useQuery({
    queryKey: proposalWorkflowStatesKey(proposal.uuid),
    queryFn: () => fetchProposalWorkflowStates(proposal.uuid),
  });

  const activeStep = useMemo(
    () => (data ?? []).find((s) => s.status === 'active'),
    [data],
  );

  // TODO: Remove cast once the regenerated SDK ships `awaiting_manual_advance`.
  const awaitingManualAdvance =
    (proposal as any).awaiting_manual_advance ?? false;

  const canManage =
    user?.is_staff ||
    hasPermission(user, {
      permission: PermissionEnum.APPROVE_AND_REJECT_PROPOSALS,
      scopeId: proposal.call_uuid,
      callOrganizerId: proposal.call_managing_organisation_uuid,
    });

  // A manager may complete/reject any non-applicant step; award_response is the
  // applicant's own action (surfaced elsewhere). Staff may act on any.
  const canActOnActiveStep =
    !!activeStep &&
    (user?.is_staff ||
      (canManage && activeStep.responsible_role !== 'applicant'));

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
    invalidateQueries: [{ queryKey: proposalWorkflowStatesKey(proposal.uuid) }],
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
    invalidateQueries: [{ queryKey: proposalWorkflowStatesKey(proposal.uuid) }],
  });

  if (!canManage) return null;

  return (
    <>
      {awaitingManualAdvance && (
        <ActionButton
          variant="primary"
          action={() => advanceStep.mutate()}
          pending={advanceStep.isPending}
          className="w-100 mt-2"
          iconNode={<ArrowRightIcon weight="bold" />}
          title={translate('Advance workflow')}
        />
      )}
      {canActOnActiveStep && (
        <>
          <ActionButton
            variant="primary"
            disabled={completeBlockedByChecklist}
            disabledReason={
              completeBlockedByChecklist
                ? translate(
                    'Answer the required checklist questions before completing this step.',
                  )
                : undefined
            }
            action={() =>
              openDialog(CompleteWorkflowStepDialog, {
                resolve: { proposal, step: activeStep, refetch },
              })
            }
            className="w-100 mt-2"
            iconNode={<CheckCircleIcon weight="bold" />}
            title={translate('Complete step')}
          />
          <ActionButton
            variant="danger"
            action={() => rejectStep.mutate()}
            className="w-100 mt-2"
            iconNode={<XCircleIcon weight="bold" />}
            title={translate('Reject at step')}
          />
        </>
      )}
    </>
  );
};
