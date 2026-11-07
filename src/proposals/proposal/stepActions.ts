import { ProposalWorkflowStepInstance } from 'waldur-js-client';

import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

import { Proposal } from '../types';

type ActionsUser = ReturnType<typeof useUser>;

export const STEP_ACTIONS_SECTION_ID = 'step-current-actions';

/**
 * What the viewer may do on the proposal's workflow from the sidebar, and
 * whether there is anything at all: the card and its entry in the section
 * rail are shown exactly when it holds a button.
 */
export const stepActionAccess = ({
  user,
  proposal,
  activeStep,
  completesActiveStep,
  withProposalActions = true,
}: {
  user: ActionsUser;
  proposal: Proposal;
  activeStep: ProposalWorkflowStepInstance | undefined;
  completesActiveStep?: boolean;
  /**
   * Whether the card also carries the proposal's own actions -- advancing a
   * parked workflow, reopening a held decision. With several steps running
   * at once only the first card does.
   */
  withProposalActions?: boolean;
}) => {
  const awaitingManualAdvance =
    withProposalActions && (proposal.awaiting_manual_advance ?? false);

  const canManage =
    user?.is_staff ||
    hasPermission(user, {
      permission: PermissionEnum.APPROVE_AND_REJECT_PROPOSALS,
      scopeId: proposal.call_uuid,
      callOrganizerId: proposal.call_managing_organisation_uuid,
    });

  // A manager may complete/reject any step the applicant does not complete;
  // an applicant step such as the award response is the applicant's own
  // action (surfaced elsewhere). Staff may act on any.
  // Reopening a held decision is narrower than acting on a step: staff, or
  // CALL.UPDATE on the call or its managing organisation, and never the
  // applicant (mirrors the backend's user_can_manage_held_decision). Support
  // sees the held decision but may not change it.
  // Only before the round publishes its results: a decision still held after
  // that is one whose release failed, which publishing again retries and the
  // backend refuses to reopen. Nor once the round's results are adopted on a
  // call that requires adoption: the adopted outcome stands. A call without
  // that requirement leaves its decisions open however the round was marked.
  const roundPublished =
    proposal.round?.lifecycle_state === 'results_published' ||
    proposal.round?.lifecycle_state === 'closed';
  const roundAdopted =
    proposal.call_adoption_required === true &&
    Boolean(proposal.round?.adopted_at);
  const canReopenDecision =
    withProposalActions &&
    proposal.decision_held === true &&
    !roundPublished &&
    !roundAdopted &&
    (user?.is_staff ||
      (user?.uuid !== proposal.created_by_uuid &&
        hasPermission(user, {
          permission: PermissionEnum.UPDATE_CALL,
          scopeId: proposal.call_uuid,
          callOrganizerId: proposal.call_managing_organisation_uuid,
        })));

  const canActOnActiveStep =
    !!activeStep &&
    (user?.is_staff || (canManage && activeStep.completer !== 'applicant'));

  const evaluatorCompletes =
    !canManage &&
    !!completesActiveStep &&
    !!activeStep &&
    activeStep.completer !== 'applicant';

  const shown =
    canReopenDecision ||
    (!!canManage && awaitingManualAdvance) ||
    evaluatorCompletes ||
    (!!canManage && !!canActOnActiveStep);

  return {
    awaitingManualAdvance,
    canManage,
    canReopenDecision,
    canActOnActiveStep,
    evaluatorCompletes,
    shown,
  };
};
