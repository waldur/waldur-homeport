import {
  CallWorkflowStep,
  proposalProposalsWorkflowStatesList,
  proposalProtectedCallsWorkflowStepsList,
  ProposalWorkflowStepInstance,
} from 'waldur-js-client';

export const proposalWorkflowStatesKey = (proposalUuid: string) =>
  ['proposalWorkflowStates', proposalUuid] as const;

export const fetchProposalWorkflowStates = (
  proposalUuid: string,
): Promise<ProposalWorkflowStepInstance[]> =>
  proposalProposalsWorkflowStatesList({
    path: { uuid: proposalUuid },
  }).then((r) => r.data ?? []);

export const callWorkflowStepsKey = (callUuid: string) =>
  ['callWorkflowSteps', callUuid] as const;

export const fetchCallWorkflowSteps = (
  callUuid: string,
): Promise<CallWorkflowStep[]> =>
  proposalProtectedCallsWorkflowStepsList({
    path: { uuid: callUuid },
  }).then((r) => r.data ?? []);
