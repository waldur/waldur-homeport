import {
  ProposalWorkflowStepInstance,
  RequestedResource,
  User,
} from 'waldur-js-client';

import { userHasRole } from '@/permissions/hasPermission';
import { Proposal } from '@/proposals/types';

export const TECHNICAL_ASSESSMENT_STEP = 'technical_assessment';

/**
 * Whether the viewer may read every technical reviewer's assessment of the
 * proposal, mirroring the backend's check on the responses endpoint:
 * staff, the call's managers, the managers of an accepted offering the
 * proposal requested, and the applicant when the step is shown to them.
 * Anyone else is refused, so asking would only produce a 403. A call whose
 * technical assessment has no checklist has no responses to read at all.
 *
 * One case is left to the backend: a blind-review step hides the peers'
 * assessments from offering managers, and the step's blind flag is not part
 * of what the proposal page loads.
 */
export const canViewTechnicalAssessment = ({
  user,
  proposal,
  workflowStates,
  resourceRows,
}: {
  user: User;
  proposal: Pick<Proposal, 'call_uuid' | 'created_by_uuid'>;
  workflowStates: ProposalWorkflowStepInstance[] | undefined;
  resourceRows: RequestedResource[] | undefined;
}): boolean => {
  const step = workflowStates?.find(
    (state) => state.step === TECHNICAL_ASSESSMENT_STEP,
  );
  if (!user || !step?.checklist_status?.has_checklist) {
    return false;
  }
  if (user.is_staff) {
    return true;
  }
  if (userHasRole(user, 'CALL.MANAGER', proposal.call_uuid)) {
    return true;
  }
  const managesRequestedOffering = (resourceRows ?? []).some(
    (row) =>
      row.requested_offering?.state === 'accepted' &&
      userHasRole(
        user,
        'OFFERING.MANAGER',
        row.requested_offering.offering_uuid,
      ),
  );
  if (managesRequestedOffering) {
    return true;
  }
  return (
    Boolean(proposal.created_by_uuid) &&
    user.uuid === proposal.created_by_uuid &&
    step.applicant_visible
  );
};
