import { WorkflowDescription } from 'waldur-js-client';

import { isRoundScoped } from './layout';

/**
 * The planned timeline of a workflow, per round: each step's bar from its
 * planned start to its planned end in days from the start of evaluation,
 * as the description's schedule plans it, against the round's time to
 * decision. The critical path is the description's, which the workflow
 * checker reads too, so the two cannot disagree on an overrun.
 */

interface PlannedRow {
  key: string;
  name: string;
  start: number;
  end: number;
  conditional: boolean;
  critical: boolean;
  roundScoped: boolean;
  noDuration: boolean;
  /** Ends after the time to decision. */
  late: boolean;
}

export interface RoundPlan {
  /** The round's name; null for a workflow without rounds. */
  name: string | null;
  /** A phase after the award: planned from the opening of its run. */
  phase?: 'extension' | 'closing';
  /** Days before the project's end the phase is timed from. */
  projectEndOffsetDays?: number | null;
  /** Day 0: the round's cut-off; null for an open-ended round or none. */
  cutoff: string | null;
  openEnded: boolean;
  decisionDay: number | null;
  decisionSource: string | null;
  totalDays: number;
  /** Days the critical path runs past the time to decision. */
  overrunDays: number;
  rows: PlannedRow[];
}

type PlannedStep = WorkflowDescription['schedule']['steps'][number];

const rowsFor = (
  description: WorkflowDescription,
  decisionDay: number | null,
  plannedSteps: PlannedStep[] = description.schedule.steps ?? [],
): PlannedRow[] => {
  const steps = new Map(description.steps.map((step) => [step.key, step]));
  return plannedSteps.map((planned) => {
    const step = steps.get(planned.key);
    return {
      key: planned.key,
      name: step?.name ?? planned.key,
      start: planned.start_day,
      end: planned.end_day,
      conditional: planned.conditional,
      critical: planned.critical,
      roundScoped: step ? isRoundScoped(step) : false,
      noDuration: planned.end_day === planned.start_day,
      late: decisionDay != null && planned.end_day > decisionDay,
    };
  });
};

const plan = (
  description: WorkflowDescription,
  base: Omit<RoundPlan, 'rows' | 'totalDays' | 'overrunDays'>,
): RoundPlan => {
  const totalDays = description.schedule.total_days;
  return {
    ...base,
    totalDays,
    overrunDays:
      base.decisionDay != null ? Math.max(0, totalDays - base.decisionDay) : 0,
    rows: rowsFor(description, base.decisionDay),
  };
};

export const roundPlans = (description: WorkflowDescription): RoundPlan[] => {
  const rounds = description.call.rounds;
  if (!rounds.length) {
    const target = description.call.target_decision_days ?? null;
    return [
      plan(description, {
        name: null,
        cutoff: null,
        openEnded: false,
        decisionDay: target,
        decisionSource: target != null ? 'target_decision_days' : null,
      }),
    ];
  }
  return rounds.map((round) =>
    plan(description, {
      name: round.name ?? null,
      cutoff: round.cutoff_time,
      openEnded: round.open_ended,
      decisionDay: round.time_to_decision_days,
      decisionSource: round.time_to_decision_source,
    }),
  );
};

/** Ticks along the day axis: a sensible step for the span shown. */
export const dayTicks = (span: number): number[] => {
  const step = span <= 21 ? 7 : span <= 90 ? 14 : span <= 180 ? 30 : 60;
  const ticks: number[] = [];
  for (let day = 0; day <= span; day += step) ticks.push(day);
  return ticks;
};

/**
 * The phases after the award -- extension requests and the final report --
 * each planned on its own from the opening of its run: they do not follow
 * the evaluation's schedule, and the decision date does not bound them.
 */
export const postAwardPlans = (description: WorkflowDescription): RoundPlan[] =>
  (description.schedule.post_award ?? []).map((phase) => ({
    name: null,
    phase: phase.phase as 'extension' | 'closing',
    projectEndOffsetDays: phase.project_end_offset_days,
    cutoff: null,
    openEnded: false,
    decisionDay: null,
    decisionSource: null,
    totalDays: phase.total_days,
    overrunDays: 0,
    rows: rowsFor(description, null, phase.steps),
  }));
