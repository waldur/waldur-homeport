import { useQuery } from '@tanstack/react-query';
import {
  CallProposalRole,
  CallWorkflowStep,
  proposalProposalsRoleAssignmentsList,
  proposalProtectedCallsProposalRolesList,
  proposalProtectedCallsWorkflowStepsList,
  ProposalRoleAssignment,
  proposalRoleAssignmentsList,
} from 'waldur-js-client';

import { OWN_ERROR_STATE } from '@/core/queryRetry';

const callProposalRolesKey = (callUuid: string) =>
  ['callProposalRoles', callUuid] as const;

/** The evaluator roles a call gives on its proposals. */
export const useCallProposalRoles = (callUuid: string, enabled = true) =>
  useQuery<CallProposalRole[]>({
    queryKey: callProposalRolesKey(callUuid),
    queryFn: () =>
      proposalProtectedCallsProposalRolesList({
        path: { uuid: callUuid },
      }).then((response) => response.data ?? []),
    enabled: Boolean(callUuid) && enabled,
    refetchOnWindowFocus: false,
    retry: false,
    // Readable by those who manage the call only. Anyone else asking is
    // answered 404, which must not take them off the page they are on.
    meta: OWN_ERROR_STATE,
  });

/**
 * The call's steps, read to tell the roles they need from the ones they do
 * not. Cached with the call's own step list, so editing a step refreshes it.
 */
export const useCallStepsNamingRoles = (callUuid: string, enabled = true) =>
  useQuery<CallWorkflowStep[]>({
    queryKey: ['callWorkflowSteps', callUuid],
    queryFn: () =>
      proposalProtectedCallsWorkflowStepsList({
        path: { uuid: callUuid },
      }).then((response) => response.data ?? []),
    enabled: Boolean(callUuid) && enabled,
    refetchOnWindowFocus: false,
    retry: false,
    meta: OWN_ERROR_STATE,
  });

export const MY_PROPOSAL_ROLE_ASSIGNMENTS_KEY = 'myProposalRoleAssignments';

const myProposalRoleAssignmentsKey = (proposalUuid: string, userUuid: string) =>
  [MY_PROPOSAL_ROLE_ASSIGNMENTS_KEY, proposalUuid, userUuid] as const;

export const proposalRoleAssignmentsKey = (proposalUuid: string) =>
  ['proposalRoleAssignments', proposalUuid] as const;

/**
 * Who holds the call's evaluator roles on a proposal. The backend answers
 * 403 to anyone not allowed to see them; that is shown in place, not by
 * taking the viewer off the proposal.
 */
export const useProposalRoleAssignments = (proposalUuid: string) =>
  useQuery<ProposalRoleAssignment[]>({
    queryKey: proposalRoleAssignmentsKey(proposalUuid),
    queryFn: () =>
      proposalProposalsRoleAssignmentsList({
        path: { uuid: proposalUuid },
      }).then((response) => response.data ?? []),
    enabled: Boolean(proposalUuid),
    refetchOnWindowFocus: false,
    retry: false,
    meta: OWN_ERROR_STATE,
  });

/**
 * The evaluator roles the viewer holds on a proposal, including those still
 * waiting for the viewer's conflict-of-interest confirmation.
 */
export const useMyProposalRoleAssignments = (
  proposalUuid: string,
  userUuid: string | undefined,
) =>
  useQuery<ProposalRoleAssignment[]>({
    queryKey: myProposalRoleAssignmentsKey(proposalUuid, userUuid),
    queryFn: () =>
      proposalRoleAssignmentsList({
        query: {
          proposal_uuid: proposalUuid,
          user_uuid: userUuid,
          is_active: true,
        },
      }).then((response) => response.data ?? []),
    enabled: Boolean(proposalUuid && userUuid),
    refetchOnWindowFocus: false,
    meta: OWN_ERROR_STATE,
  });
