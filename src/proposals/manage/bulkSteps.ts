import { Proposal, ProposalWorkflowStepInstance } from 'waldur-js-client';

import { format, getErrorBody } from '@/core/ErrorMessageFormatter';

interface StepTarget {
  proposal: Pick<Proposal, 'uuid' | 'name'>;
  instance: ProposalWorkflowStepInstance;
}

/** The selected proposals standing on one step of the call. */
export interface StepGroup {
  callStepUuid: string;
  stepName: string;
  allowedOutcomes: string[];
  targets: StepTarget[];
}

/**
 * Whether a call manager can take the step for many proposals at once with
 * one outcome and one reason: a plain decision. The allocation decision
 * settles each award and its budget, an assessment waits for its
 * contributors, a round step is taken once per round, and an applicant
 * action is the applicant's -- all of those stay on each proposal's page.
 */
const isDecidableInBulk = (instance: ProposalWorkflowStepInstance) =>
  instance.status === 'active' &&
  instance.kind === 'decision' &&
  !instance.is_allocation_decision &&
  !instance.round_scoped;

/** The selection grouped by the step each proposal stands on, largest group
 * first. A proposal running steps side by side may stand in two groups. */
export const groupByDecisionStep = (
  states: {
    proposal: Pick<Proposal, 'uuid' | 'name'>;
    instances: ProposalWorkflowStepInstance[];
  }[],
): StepGroup[] => {
  const groups = new Map<string, StepGroup>();
  for (const { proposal, instances } of states) {
    for (const instance of instances.filter(isDecidableInBulk)) {
      const group = groups.get(instance.call_step_uuid) ?? {
        callStepUuid: instance.call_step_uuid,
        stepName: instance.step_name,
        allowedOutcomes: instance.allowed_outcomes ?? [],
        targets: [],
      };
      group.targets.push({ proposal, instance });
      groups.set(instance.call_step_uuid, group);
    }
  }
  return [...groups.values()].sort(
    (a, b) => b.targets.length - a.targets.length,
  );
};

/** What the backend said when it refused one proposal. */
const refusalOf = (error): string => {
  const detail = getErrorBody(error)?.detail;
  if (Array.isArray(detail)) return detail.join(' ');
  if (typeof detail === 'string') return detail;
  return format(error);
};

export interface BulkFailure {
  name: string;
  reason: string;
}

/**
 * Run `action` on each item, a few at a time: one refusal does not stop the
 * others, and each is reported with the item's name.
 */
export const runEach = async <T>(
  items: T[],
  action: (item: T) => Promise<unknown>,
  nameOf: (item: T) => string,
  concurrency = 4,
): Promise<{ done: number; failures: BulkFailure[] }> => {
  let done = 0;
  const failures: BulkFailure[] = [];
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const item = items[next++];
      try {
        await action(item);
        done += 1;
      } catch (error) {
        failures.push({ name: nameOf(item), reason: refusalOf(error) });
      }
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, worker),
  );
  return { done, failures };
};
