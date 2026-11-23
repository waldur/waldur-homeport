import {
  OrderFlowDescription,
  OrderFlowStep,
  OrderFlowTerminal,
} from 'waldur-js-client';

/**
 * Where everything of the order-flow drawing goes: a lane per actor, a
 * column per step in the order an order passes them, the ends an order can
 * leave by in a row of their own, and the edges between them. Pure
 * geometry from the description, so the same description always draws the
 * same picture.
 */

export const LANE_LABEL_WIDTH = 150;
const COLUMN_WIDTH = 160;
const BOX_WIDTH = 140;
const BOX_HEIGHT = 70;
const LANE_HEIGHT = 96;
export const HEADER_HEIGHT = 28;
const TERMINAL_ROW_HEIGHT = 64;
const TERMINAL_HEIGHT = 32;
const TERMINAL_WIDTH = 112;

export interface FlowBox {
  step: OrderFlowStep;
  column: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FlowTerminal {
  terminal: OrderFlowTerminal;
  /** Position among the ends: its edges run along their own line. */
  index: number;
  /** The line its edges run along, just above the row of ends. */
  busY: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

type FlowEdgeKind = 'sequence' | 'bypass' | 'negative';

export interface FlowEdge {
  kind: FlowEdgeKind;
  source: string;
  /** A step key, or `terminal:<key>`. */
  target: string;
}

interface FlowLane {
  key: string;
  label: string;
  y: number;
  height: number;
}

export interface FlowLayout {
  width: number;
  height: number;
  lanes: FlowLane[];
  boxes: FlowBox[];
  terminals: FlowTerminal[];
  edges: FlowEdge[];
  /** Top of the row of ends. */
  terminalRowY: number;
}

export const terminalId = (key: string) => `terminal:${key}`;

/** The step an order reaches next from `index`: the first one that is not
 * skipped. */
const nextRunning = (steps: OrderFlowStep[], index: number) =>
  steps.findIndex((step, i) => i > index && step.status !== 'skipped');

export const layoutOrderFlow = (
  description: OrderFlowDescription,
  showSkipped = true,
): FlowLayout => {
  const steps = description.steps.filter(
    (step) => showSkipped || step.status !== 'skipped',
  );
  const lanes: FlowLane[] = description.actors.map((actor, index) => ({
    key: actor.key,
    label: actor.label,
    y: HEADER_HEIGHT + index * LANE_HEIGHT,
    height: LANE_HEIGHT,
  }));
  const laneY = new Map(lanes.map((lane) => [lane.key, lane.y]));
  const boxes: FlowBox[] = steps.map((step, column) => ({
    step,
    column,
    x:
      LANE_LABEL_WIDTH + column * COLUMN_WIDTH + (COLUMN_WIDTH - BOX_WIDTH) / 2,
    y:
      (laneY.get(step.actor) ?? HEADER_HEIGHT) + (LANE_HEIGHT - BOX_HEIGHT) / 2,
    width: BOX_WIDTH,
    height: BOX_HEIGHT,
  }));
  const column = new Map<string, number>(
    boxes.map((box) => [box.step.key, box.column]),
  );

  const edges: FlowEdge[] = [];
  steps.forEach((step, index) => {
    if (index === steps.length - 1) return;
    // A skipped step is drawn where it would be, reached by a dotted edge;
    // the order itself goes on to the next step that runs.
    if (step.status === 'skipped') return;
    const next = steps[index + 1];
    edges.push({
      kind: next.status === 'skipped' ? 'bypass' : 'sequence',
      source: step.key,
      target: next.key,
    });
    if (next.status === 'skipped') {
      const target = nextRunning(steps, index);
      if (target > 0) {
        edges.push({
          kind: 'sequence',
          source: step.key,
          target: steps[target].key,
        });
      }
    }
  });

  const terminalRowY = HEADER_HEIGHT + lanes.length * LANE_HEIGHT;
  // Each end sits under the first step that leads to it, nudged right when
  // two would share a column.
  const taken = new Set<number>();
  const terminals: FlowTerminal[] = [];
  description.terminals.forEach((terminal) => {
    const sources = terminal.from_steps.filter((key) => column.has(key));
    if (!sources.length) return;
    let at = Math.min(...sources.map((key) => column.get(key)!));
    while (taken.has(at)) at += 1;
    taken.add(at);
    terminals.push({
      terminal,
      index: terminals.length,
      busY: terminalRowY + 4 + terminals.length * 4,
      x:
        LANE_LABEL_WIDTH +
        at * COLUMN_WIDTH +
        (COLUMN_WIDTH - TERMINAL_WIDTH) / 2,
      y: terminalRowY + (TERMINAL_ROW_HEIGHT - TERMINAL_HEIGHT) / 2,
      width: TERMINAL_WIDTH,
      height: TERMINAL_HEIGHT,
    });
    sources.forEach((key) =>
      edges.push({
        kind: 'negative',
        source: key,
        target: terminalId(terminal.key),
      }),
    );
  });

  const columns = Math.max(steps.length, ...[...taken].map((c) => c + 1));
  return {
    width: LANE_LABEL_WIDTH + columns * COLUMN_WIDTH + 16,
    height: terminalRowY + (terminals.length ? TERMINAL_ROW_HEIGHT : 8),
    lanes,
    boxes,
    terminals,
    edges,
    terminalRowY,
  };
};
