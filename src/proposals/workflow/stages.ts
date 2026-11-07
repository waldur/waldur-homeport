import { ProposalWorkflowStepInstance } from 'waldur-js-client';

type StagedStep = Pick<ProposalWorkflowStepInstance, 'status'> &
  Partial<Pick<ProposalWorkflowStepInstance, 'stage' | 'order'>>;

/**
 * The proposal's active steps, in the order of its path. Several when the
 * proposal stands in a stage whose steps run at the same time; the backend's
 * current step is the first of them.
 */
export const activeStepsOf = <T extends StagedStep>(
  steps: T[] | null | undefined,
): T[] => (steps ?? []).filter((step) => step.status === 'active');

/** A step the proposal skipped because its run condition did not hold. */
export const isConditionSkipped = (
  step: Pick<ProposalWorkflowStepInstance, 'status' | 'skipped_reason'>,
): boolean =>
  step.status === 'skipped' && step.skipped_reason === 'condition_not_met';

const stageOf = (step: Partial<Pick<StagedStep, 'stage' | 'order'>>) =>
  step.stage ?? step.order;

/**
 * Consecutive steps of one stage grouped together, keeping the path's order.
 * A step without a stage is a stage of its own.
 */
export const groupByStage = <
  T extends Partial<Pick<StagedStep, 'stage' | 'order'>>,
>(
  steps: T[],
): T[][] =>
  steps.reduce<T[][]>((groups, step) => {
    const last = groups[groups.length - 1];
    const stage = stageOf(step);
    if (last && stage !== undefined && stageOf(last[0]) === stage) {
      last.push(step);
    } else {
      groups.push([step]);
    }
    return groups;
  }, []);

type StageStep = StagedStep & Pick<ProposalWorkflowStepInstance, 'step'>;

/**
 * Whether the proposal still stands in the stage of `step`: another step of
 * it is still running, or the stage waits for a manual advance on one of
 * its steps (`currentStepKey`). The completed work of such a step may still
 * be reopened. Mirrors the backend's may_reopen_step_work.
 */
export const stageStillOpen = (
  step: StageStep,
  steps: StageStep[],
  awaitingManualAdvance: boolean,
  currentStepKey?: string | null,
): boolean => {
  const stage = stageOf(step);
  const mates = steps.filter((other) =>
    stage === undefined ? other === step : stageOf(other) === stage,
  );
  if (mates.some((other) => other.status === 'active')) return true;
  return (
    awaitingManualAdvance &&
    mates.some((other) => other.step === currentStepKey)
  );
};

type ConfiguredStep = { uuid: string; order: number } & {
  parallel_with_previous?: boolean;
};

/**
 * The call's steps in stages, as the engine will run them: a step flagged to
 * run alongside the previous one joins that step's stage. Takes the steps in
 * the order of the workflow, disabled ones included, as the backend does.
 */
export const configuredStages = <T extends ConfiguredStep>(steps: T[]): T[][] =>
  [...steps]
    .sort((a, b) => a.order - b.order)
    .reduce<T[][]>((stages, step) => {
      const last = stages[stages.length - 1];
      if (last && step.parallel_with_previous) {
        last.push(step);
      } else {
        stages.push([step]);
      }
      return stages;
    }, []);

type StagePosition = { stage: number; size: number; position: number };

/**
 * Where each step stands: the index of its stage, the stage's size and its
 * position in it.
 */
export const stagePositions = <T extends ConfiguredStep>(
  steps: T[],
): Map<string, StagePosition> => {
  const positions = new Map<string, StagePosition>();
  configuredStages(steps).forEach((members, stage) =>
    members.forEach((step, position) =>
      positions.set(step.uuid, { stage, size: members.length, position }),
    ),
  );
  return positions;
};

/**
 * How many steps run in parallel from `rows[index]` on, when that row opens
 * a run of two or more consecutive rows of one stage; 0 otherwise. Works on
 * the rows as listed, so a stage cut down by a filter to one row is no
 * longer shown as parallel.
 */
export const parallelRunAt = <T>(
  rows: T[],
  index: number,
  stageKey: (row: T) => unknown,
): number => {
  const key = stageKey(rows[index]);
  if (key === undefined || key === null) return 0;
  if (index > 0 && stageKey(rows[index - 1]) === key) return 0;
  let end = index + 1;
  while (end < rows.length && stageKey(rows[end]) === key) end++;
  const size = end - index;
  return size > 1 ? size : 0;
};

export type WorkflowPhaseKey = 'evaluation' | 'extension' | 'closing';

const phaseOf = (row: { phase?: string | null }): WorkflowPhaseKey =>
  (row.phase as WorkflowPhaseKey) || 'evaluation';

/**
 * The phase `rows[index]` opens, when the rows hold more than the
 * evaluation and this row is the first of its phase in a run; null
 * otherwise. A list of evaluation steps alone needs no phase headers.
 */
export const phaseOpenedAt = <T extends { phase?: string | null }>(
  rows: T[],
  index: number,
): WorkflowPhaseKey | null => {
  if (!rows.some((row) => phaseOf(row) !== 'evaluation')) return null;
  const phase = phaseOf(rows[index]);
  if (index > 0 && phaseOf(rows[index - 1]) === phase) return null;
  return phase;
};
