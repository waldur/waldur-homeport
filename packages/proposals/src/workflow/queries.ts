import { useQuery } from '@tanstack/react-query';
import {
  CallWorkflowStep,
  proposalProposalsWorkflowStatesList,
  proposalProtectedCallsWorkflowStepKindsList,
  proposalProtectedCallsWorkflowStepsList,
  ProposalWorkflowStepInstance,
  StepKind,
} from 'waldur-js-client';

export const proposalWorkflowStatesKey = (proposalUuid: string) =>
  ['proposalWorkflowStates', proposalUuid] as const;

/**
 * The latest instance of each call step, in the order given. A step of an
 * extension runs once per extension request; the page follows the latest
 * run, and the runs' history is listed on their own.
 */
export const latestInstanceOfEachStep = (
  steps: ProposalWorkflowStepInstance[],
): ProposalWorkflowStepInstance[] => {
  const last = new Map<string, number>();
  steps.forEach((step, index) => {
    if (step.run_uuid) last.set(step.call_step_uuid, index);
  });
  return steps.filter(
    (step, index) => !step.run_uuid || last.get(step.call_step_uuid) === index,
  );
};

export const fetchProposalWorkflowStates = (
  proposalUuid: string,
): Promise<ProposalWorkflowStepInstance[]> =>
  proposalProposalsWorkflowStatesList({
    path: { uuid: proposalUuid },
  }).then((r) => latestInstanceOfEachStep(r.data ?? []));

export const callWorkflowStepsKey = (callUuid: string) =>
  ['callWorkflowSteps', callUuid] as const;

export const fetchCallWorkflowSteps = (
  callUuid: string,
): Promise<CallWorkflowStep[]> =>
  proposalProtectedCallsWorkflowStepsList({
    path: { uuid: callUuid },
  }).then((r) => r.data ?? []);

const workflowStepKindsKey = ['workflowStepKinds'] as const;

/**
 * The kinds call steps are made of: their outcome sets, default completer and
 * the fields that configure them. Defined in the backend's code, so they do
 * not change while the page is open -- one fetch serves the whole screen.
 */
export const useWorkflowStepKinds = () =>
  useQuery<StepKind[]>({
    queryKey: workflowStepKindsKey,
    queryFn: () =>
      proposalProtectedCallsWorkflowStepKindsList().then((r) => r.data ?? []),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
