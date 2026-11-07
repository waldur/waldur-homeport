import {
  DryRunActionRequest,
  DryRunCoverage,
  DryRunLogEntry,
  DryRunStepState,
  WorkflowDryRunParametersRequest,
} from 'waldur-js-client';

import { translate } from '@/i18n';

/** Outcomes that end a workflow, or a contribution, negatively. */
const NEGATIVE = new Set(['declined', 'ineligible', 'infeasible', 'rejected']);

const isNegativeOutcome = (outcome: string) => NEGATIVE.has(outcome);

export interface ViewAs {
  role: string;
  offering?: number | null;
}

/**
 * The request a dry run sends: the whole path, every time. The backend
 * replays it from scratch, so nothing is kept between clicks and rewinding
 * is sending fewer actions.
 */
export const dryRunRequest = (
  actions: DryRunActionRequest[],
  offerings: string[] | null,
  viewAs: ViewAs | null,
): WorkflowDryRunParametersRequest => ({
  actions,
  ...(offerings ? { requested_offerings: offerings } : {}),
  ...(viewAs
    ? {
        view_as: {
          role: viewAs.role,
          offering: viewAs.offering ?? null,
        },
      }
    : {}),
});

/**
 * The actions that lead to a log entry: those up to and including the one
 * that produced it. Entries made before any action (the submission) keep
 * none.
 */
export const actionsUpTo = (
  actions: DryRunActionRequest[],
  entry: Pick<DryRunLogEntry, 'action'>,
) => (entry.action === null ? [] : actions.slice(0, entry.action + 1));

/**
 * The actions before a step started: rewinding there shows the step about
 * to start, as the proposal stood when it did.
 */
export const actionsBeforeStep = (
  actions: DryRunActionRequest[],
  log: DryRunLogEntry[],
  stepKey: string,
) => {
  const started = log.find(
    (entry) => entry.kind === 'started' && entry.step === stepKey,
  );
  if (!started) return null;
  return actionsUpTo(actions, started);
};

/** Coverage over a session's runs: what each run tried, merged. */
export interface CoverageTotals {
  steps: string[];
  exercised: string[];
  outcomes: Record<string, { available: string[]; tried: string[] }>;
  contributionOutcomes: Record<
    string,
    { available: string[]; tried: string[] }
  >;
}

export const EMPTY_COVERAGE: CoverageTotals = {
  steps: [],
  exercised: [],
  outcomes: {},
  contributionOutcomes: {},
};

const union = (a: string[], b: string[]) => Array.from(new Set([...a, ...b]));

const mergeOutcomes = (
  totals: CoverageTotals['outcomes'],
  run: DryRunCoverage['outcomes'],
) => {
  const merged = { ...totals };
  Object.entries(run).forEach(([key, value]) => {
    merged[key] = {
      available: value.available,
      tried: union(merged[key]?.tried ?? [], value.tried),
    };
  });
  return merged;
};

export const mergeCoverage = (
  totals: CoverageTotals,
  run: DryRunCoverage,
): CoverageTotals => ({
  steps: run.steps,
  exercised: union(totals.exercised, run.exercised),
  outcomes: mergeOutcomes(totals.outcomes, run.outcomes),
  contributionOutcomes: mergeOutcomes(
    totals.contributionOutcomes,
    run.contribution_outcomes,
  ),
});

/** What a session has not tried yet, as "Step = outcome" pairs. */
export const untried = (
  totals: CoverageTotals,
  names: Record<string, string>,
) =>
  Object.entries(totals.outcomes).flatMap(([key, value]) =>
    value.available
      .filter((outcome) => !value.tried.includes(outcome))
      .map((outcome) => `${names[key] ?? key} = ${outcome}`),
  );

export const coverageCounts = (totals: CoverageTotals) => {
  const outcomes = Object.values(totals.outcomes);
  return {
    steps: totals.steps.length,
    exercised: totals.exercised.filter((key) => totals.steps.includes(key))
      .length,
    outcomes: outcomes.reduce((sum, v) => sum + v.available.length, 0),
    outcomesTried: outcomes.reduce(
      (sum, v) => sum + v.tried.filter((o) => v.available.includes(o)).length,
      0,
    ),
  };
};

/** Proposal states after which a step not yet started never will. */
const ENDED = ['rejected', 'canceled'];

/**
 * Whether a step will never run: the proposal ended before it started --
 * rejected or cancelled, or accepted with the step of the evaluation still
 * waiting. Steps after the award run again with every request, so they are
 * never out of reach.
 */
const isNotReached = (
  step: Pick<DryRunStepState, 'status' | 'phase'>,
  proposalState: string,
) =>
  step.status === 'pending' &&
  (ENDED.includes(proposalState) ||
    (proposalState === 'accepted' && step.phase === 'evaluation'));

export const stepStatusLabel = (
  step: DryRunStepState,
  proposalState: string,
) => {
  if (step.automatic) return translate('Decided automatically');
  if (isNotReached(step, proposalState)) return translate('Not reached');
  switch (step.status) {
    case 'active':
      return step.changes_requested
        ? translate('Waiting on the applicant')
        : translate('Active');
    case 'completed':
      return translate('Completed');
    case 'skipped':
      return step.skipped_reason === 'condition'
        ? translate('Skipped by condition')
        : translate('Disabled');
    case 'expired':
      return translate('Lapsed');
    case 'withdrawn':
      return translate('Withdrawn');
    default:
      return translate('Pending');
  }
};

export const stepStatusVariant = (step: DryRunStepState) => {
  switch (step.status) {
    case 'active':
      return 'primary' as const;
    case 'completed':
      return step.outcome && isNegativeOutcome(step.outcome)
        ? ('danger' as const)
        : ('success' as const);
    case 'expired':
    case 'withdrawn':
      return 'warning' as const;
    default:
      return 'neutral' as const;
  }
};

/** Where a step after the award runs: which extension request, or the
 * final report; null for a step of the evaluation. */
export const stepRunLabel = (
  step: Pick<DryRunStepState, 'phase' | 'run'>,
): string | null => {
  if (step.phase === 'extension') {
    return translate('Extension request {number}', { number: step.run ?? 1 });
  }
  if (step.phase === 'closing') return translate('Final report');
  return null;
};

/** A step's row: a step after the award runs again in every run. */
export const stepRowKey = (step: Pick<DryRunStepState, 'key' | 'run'>) =>
  step.run ? `${step.key}#${step.run}` : step.key;

/** "Day 3", "Days 3–8": where a step sits in simulated time. */
export const stepDays = (step: DryRunStepState) => {
  if (step.started_day === null) return '';
  const end = step.ended_day ?? step.deadline_day;
  if (end === null || end === step.started_day) {
    return translate('Day {day}', { day: step.started_day });
  }
  return translate('Days {start}–{end}', {
    start: step.started_day,
    end,
  });
};
