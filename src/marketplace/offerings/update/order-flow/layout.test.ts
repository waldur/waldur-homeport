import { describe, expect, it } from 'vitest';
import {
  OrderFlowDescription,
  OrderFlowStep,
  OrderFlowStepStatusEnum,
} from 'waldur-js-client';

import { layoutOrderFlow, terminalId } from './layout';

const step = (
  key: OrderFlowStep['key'],
  actor: OrderFlowStep['actor'],
  status: OrderFlowStepStatusEnum,
  canReject = false,
): OrderFlowStep => ({
  key,
  label: key,
  actor,
  status,
  summary: '',
  rules: [],
  sources: [],
  notes: [],
  can_reject: canReject,
  mode: null,
});

// A Basic offering ordered by staff: consumer review and the start-date
// wait are skipped, the provider reviews, and approval completes the order.
const basicByStaff = {
  actors: [
    { key: 'consumer', label: 'Consumer' },
    { key: 'provider', label: 'Service provider' },
    { key: 'scheduler', label: 'Waldur scheduler' },
    { key: 'backend', label: 'Waldur' },
  ],
  steps: [
    step('placed', 'consumer', 'runs'),
    step('consumer_review', 'consumer', 'skipped'),
    step('project_start', 'scheduler', 'conditional'),
    step('provider_review', 'provider', 'runs', true),
    step('start_date', 'scheduler', 'skipped'),
    step('execution', 'backend', 'runs'),
    step('done', 'backend', 'runs'),
  ],
  terminals: [
    { key: 'rejected', from_steps: ['provider_review'], retry: false },
    {
      key: 'canceled',
      from_steps: ['provider_review', 'execution'],
      retry: false,
    },
    { key: 'erred', from_steps: ['execution'], retry: true },
  ],
} as unknown as OrderFlowDescription;

describe('layoutOrderFlow', () => {
  it('puts each step in its actor lane, one column per step', () => {
    const layout = layoutOrderFlow(basicByStaff);
    const lanes = new Map(layout.lanes.map((lane) => [lane.key, lane]));
    for (const box of layout.boxes) {
      const lane = lanes.get(box.step.actor)!;
      expect(box.y).toBeGreaterThanOrEqual(lane.y);
      expect(box.y + box.height).toBeLessThanOrEqual(lane.y + lane.height);
    }
    const xs = layout.boxes.map((box) => box.x);
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);
    expect(new Set(xs).size).toBe(xs.length);
  });

  it('bypasses a skipped step and goes on to the next one that runs', () => {
    const { edges } = layoutOrderFlow(basicByStaff);
    expect(edges).toContainEqual({
      kind: 'bypass',
      source: 'placed',
      target: 'consumer_review',
    });
    expect(edges).toContainEqual({
      kind: 'sequence',
      source: 'placed',
      target: 'project_start',
    });
    expect(edges).toContainEqual({
      kind: 'sequence',
      source: 'provider_review',
      target: 'execution',
    });
    // Nothing leaves a skipped step.
    expect(edges.some((edge) => edge.source === 'consumer_review')).toBe(false);
  });

  it('draws every end in the bottom row without two in one place', () => {
    const layout = layoutOrderFlow(basicByStaff);
    expect(layout.terminals).toHaveLength(3);
    const xs = layout.terminals.map((terminal) => terminal.x);
    expect(new Set(xs).size).toBe(3);
    layout.terminals.forEach((terminal) =>
      expect(terminal.y).toBeGreaterThanOrEqual(layout.terminalRowY),
    );
    expect(layout.edges).toContainEqual({
      kind: 'negative',
      source: 'execution',
      target: terminalId('erred'),
    });
  });

  it('can leave skipped steps out', () => {
    const layout = layoutOrderFlow(basicByStaff, false);
    expect(layout.boxes.map((box) => box.step.key)).toEqual([
      'placed',
      'project_start',
      'provider_review',
      'execution',
      'done',
    ]);
    expect(layout.edges.every((edge) => edge.kind !== 'bypass')).toBe(true);
  });
});
