import { WorkflowDescription, WorkflowDescriptionStep } from 'waldur-js-client';

/**
 * Where everything of the swimlane diagram goes: one lane per actor that
 * completes a step, one column per stage, a box per step, the terminal
 * nodes a negative outcome or a request for changes leads to, and the
 * edges between them. Pure geometry from the workflow description, so the
 * same description always draws the same picture and nothing overlaps.
 */

export const LANE_LABEL_WIDTH = 168;
export const COLUMN_WIDTH = 232;
const BOX_WIDTH = 192;
const BOX_HEIGHT = 92;
const TERMINAL_HEIGHT = 40;
const GAP = 18;
export const HEADER_HEIGHT = 32;

export type TerminalKind = 'rejected' | 'canceled' | 'returned';

type EdgeKind =
  'sequence' | 'condition' | 'bypass' | 'input' | 'negative' | 'change_request';

export interface DiagramBox {
  step: WorkflowDescriptionStep;
  lane: string;
  column: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DiagramTerminal {
  kind: TerminalKind;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DiagramEdge {
  kind: EdgeKind;
  from: string;
  /** A step key, or `terminal:<kind>`. */
  to: string;
  label?: string;
}

interface DiagramLane {
  key: string;
  label: string;
  y: number;
  height: number;
}

interface DiagramColumn {
  stage: number;
  x: number;
  steps: number;
  /** The phase of the column's steps: a stage never spans phases. */
  phase: string;
}

/** The columns of a phase after the award, drawn as a section of its own. */
interface DiagramSection {
  phase: string;
  x: number;
  width: number;
}

export interface DiagramLayout {
  width: number;
  height: number;
  lanes: DiagramLane[];
  columns: DiagramColumn[];
  sections: DiagramSection[];
  boxes: DiagramBox[];
  terminals: DiagramTerminal[];
  edges: DiagramEdge[];
}

export const terminalId = (kind: TerminalKind) => `terminal:${kind}`;

/** The actor whose lane a step sits in: whoever completes it. */
export const stepLane = (step: WorkflowDescriptionStep): string => {
  if (step.decides_automatically) return 'system';
  if (step.kind === 'applicant_action') return 'applicant';
  const completer = step.roles.find(
    (cell) => cell.completes.value && cell.actor !== 'system',
  );
  return completer?.actor ?? 'call_manager';
};

/** Actors contributing to a step without completing it: shown on its box. */
export const stepContributors = (step: WorkflowDescriptionStep): string[] =>
  step.roles
    .filter((cell) => cell.contributes.value && !cell.completes.value)
    .map((cell) => cell.actor);

const negativeOutcomes = (step: WorkflowDescriptionStep) =>
  step.outcomes.filter((outcome) => outcome.polarity === 'negative');

/** When the step runs: the evaluation, or an extension or the closing
 * after the award. */
const stepPhase = (step: WorkflowDescriptionStep): string =>
  step.phase ?? 'evaluation';

const isPostAward = (step: WorkflowDescriptionStep) =>
  stepPhase(step) !== 'evaluation';

/** Where a negative outcome of the step takes the proposal, if anywhere.
 * After the award it only closes the run: the proposal stays accepted. */
const negativeTerminal = (
  step: WorkflowDescriptionStep,
): TerminalKind | null => {
  if (!negativeOutcomes(step).length || isPostAward(step)) return null;
  if (step.on_negative === 'reject') return 'rejected';
  if (step.on_negative === 'cancel') return 'canceled';
  return null;
};

/** A per-round step: drawn with a badge. Only present once the call can
 * have such steps; absent, nothing is drawn. */
export const isRoundScoped = (step: WorkflowDescriptionStep): boolean =>
  Boolean((step.extra as Record<string, unknown> | undefined)?.round_scoped);

export const layoutDiagram = (
  description: WorkflowDescription,
  {
    showDisabled = false,
    actorLabel = (key: string) => key,
    conditionLabel = (step: WorkflowDescriptionStep) =>
      step.run_condition?.step ?? '',
  }: {
    showDisabled?: boolean;
    actorLabel?: (key: string) => string;
    conditionLabel?: (step: WorkflowDescriptionStep) => string;
  } = {},
): DiagramLayout => {
  const steps = [...description.steps]
    .filter((step) => showDisabled || step.enabled)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Columns: the stages that have a visible step, left to right.
  const stages = Array.from(new Set(steps.map((step) => step.stage))).sort(
    (a, b) => a - b,
  );
  const columnOf = new Map(stages.map((stage, index) => [stage, index]));
  const phaseOfStage = new Map(
    steps.map((step) => [step.stage, stepPhase(step)]),
  );
  const columnPhase = (column: number) =>
    phaseOfStage.get(stages[column]) ?? 'evaluation';

  // Lanes: the actors completing a visible step, in the description's order.
  const laneKeys = new Set(steps.map(stepLane));
  const actorOrder = description.actors.map((actor) => actor.key);
  const orderedLanes = [
    ...actorOrder.filter((key) => laneKeys.has(key)),
    ...Array.from(laneKeys).filter((key) => !actorOrder.includes(key)),
  ];

  // Terminal nodes, in a column of their own at the right.
  const terminalKinds: TerminalKind[] = [];
  for (const kind of ['rejected', 'canceled'] as TerminalKind[]) {
    if (steps.some((step) => negativeTerminal(step) === kind)) {
      terminalKinds.push(kind);
    }
  }
  if (steps.some((step) => step.allows_change_requests)) {
    terminalKinds.push('returned');
  }
  const terminalLane = orderedLanes.includes('applicant')
    ? 'applicant'
    : orderedLanes[0];

  // How many boxes stack in each lane's busiest column.
  const cellCounts = new Map<string, number>();
  const rowOf = new Map<string, number>();
  for (const step of steps) {
    const cellKey = `${stepLane(step)}|${columnOf.get(step.stage)}`;
    const row = cellCounts.get(cellKey) ?? 0;
    rowOf.set(step.key, row);
    cellCounts.set(cellKey, row + 1);
  }
  const terminalRows = Math.ceil(
    (terminalKinds.length * (TERMINAL_HEIGHT + GAP)) / (BOX_HEIGHT + GAP),
  );

  const lanes: DiagramLane[] = [];
  let y = HEADER_HEIGHT;
  for (const key of orderedLanes) {
    let rows = 1;
    for (const [cellKey, count] of cellCounts) {
      if (cellKey.startsWith(`${key}|`)) rows = Math.max(rows, count);
    }
    if (key === terminalLane) rows = Math.max(rows, terminalRows);
    const height = rows * (BOX_HEIGHT + GAP) + GAP;
    lanes.push({ key, label: actorLabel(key), y, height });
    y += height;
  }
  const laneByKey = new Map(lanes.map((lane) => [lane.key, lane]));

  const columnX = (column: number) =>
    LANE_LABEL_WIDTH + column * COLUMN_WIDTH + (COLUMN_WIDTH - BOX_WIDTH) / 2;

  const boxes: DiagramBox[] = steps.map((step) => {
    const lane = laneByKey.get(stepLane(step))!;
    const column = columnOf.get(step.stage)!;
    return {
      step,
      lane: lane.key,
      column,
      x: columnX(column),
      y: lane.y + GAP + rowOf.get(step.key)! * (BOX_HEIGHT + GAP),
      width: BOX_WIDTH,
      height: BOX_HEIGHT,
    };
  });

  const terminals: DiagramTerminal[] = terminalKinds.map((kind, index) => {
    const lane = laneByKey.get(terminalLane)!;
    return {
      kind,
      x: columnX(stages.length),
      y: lane.y + GAP + index * (TERMINAL_HEIGHT + GAP),
      width: BOX_WIDTH,
      height: TERMINAL_HEIGHT,
    };
  });

  const edges: DiagramEdge[] = [];
  const byColumn = new Map<number, DiagramBox[]>();
  for (const box of boxes) {
    byColumn.set(box.column, [...(byColumn.get(box.column) ?? []), box]);
  }
  const visible = new Set(steps.map((step) => step.key));
  for (let column = 1; column < stages.length; column++) {
    // A phase after the award opens on its own, later: no step of another
    // phase leads into it.
    if (columnPhase(column) !== columnPhase(column - 1)) continue;
    const previous = byColumn.get(column - 1) ?? [];
    const current = byColumn.get(column) ?? [];
    for (const target of current) {
      const conditional = Boolean(target.step.run_condition);
      for (const source of previous) {
        edges.push({
          kind: conditional ? 'condition' : 'sequence',
          from: source.step.key,
          to: target.step.key,
          label: conditional ? conditionLabel(target.step) : undefined,
        });
      }
    }
    // A stage whose every step may be skipped can be passed by.
    const next =
      columnPhase(column + 1) === columnPhase(column)
        ? (byColumn.get(column + 1) ?? [])
        : [];
    if (
      current.length &&
      current.every((box) => box.step.run_condition) &&
      previous.length &&
      next.length
    ) {
      edges.push({
        kind: 'bypass',
        from: previous[0].step.key,
        to: next[0].step.key,
      });
    }
  }
  for (const box of boxes) {
    for (const input of box.step.input_steps) {
      if (visible.has(input)) {
        edges.push({ kind: 'input', from: input, to: box.step.key });
      }
    }
    const terminal = negativeTerminal(box.step);
    if (terminal) {
      edges.push({
        kind: 'negative',
        from: box.step.key,
        to: terminalId(terminal),
      });
    }
    if (box.step.allows_change_requests) {
      edges.push({
        kind: 'change_request',
        from: box.step.key,
        to: terminalId('returned'),
      });
    }
  }

  return {
    width:
      LANE_LABEL_WIDTH +
      (stages.length + (terminalKinds.length ? 1 : 0)) * COLUMN_WIDTH,
    height: y,
    lanes,
    columns: stages.map((stage, index) => ({
      stage,
      x: LANE_LABEL_WIDTH + index * COLUMN_WIDTH,
      steps: byColumn.get(index)?.length ?? 0,
      phase: columnPhase(index),
    })),
    sections: Array.from(new Set(stages.map((_, index) => columnPhase(index))))
      .filter((phase) => phase !== 'evaluation')
      .map((phase) => {
        const columns = stages
          .map((_, index) => index)
          .filter((index) => columnPhase(index) === phase);
        return {
          phase,
          x: LANE_LABEL_WIDTH + columns[0] * COLUMN_WIDTH,
          width: columns.length * COLUMN_WIDTH,
        };
      }),
    boxes,
    terminals,
    edges,
  };
};

/** Whether any two boxes or terminal nodes overlap: never, by design. */
export const overlaps = (layout: DiagramLayout): boolean => {
  const rects = [...layout.boxes, ...layout.terminals];
  return rects.some((a, i) =>
    rects.some(
      (b, j) =>
        i < j &&
        a.x < b.x + b.width &&
        b.x < a.x + a.width &&
        a.y < b.y + b.height &&
        b.y < a.y + a.height,
    ),
  );
};
