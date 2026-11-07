import { describe, expect, it } from 'vitest';

import {
  activeStepsOf,
  configuredStages,
  groupByStage,
  isConditionSkipped,
  parallelRunAt,
  phaseOpenedAt,
  stagePositions,
  stageStillOpen,
} from './stages';

describe('workflow stages', () => {
  const step = (
    uuid: string,
    order: number,
    stage?: number,
    status = 'pending',
  ) => ({ uuid, order, stage, status }) as any;

  it('groups the steps of one stage, keeping the order of the path', () => {
    const steps = [
      step('a', 0, 0),
      step('b', 1, 1),
      step('c', 2, 1),
      step('d', 3, 3),
    ];
    expect(
      groupByStage(steps).map((group) => group.map((s: any) => s.uuid)),
    ).toEqual([['a'], ['b', 'c'], ['d']]);
  });

  it('treats a step without a stage as a stage of its own', () => {
    expect(groupByStage([step('a', 0), step('b', 1)])).toHaveLength(2);
  });

  it('lists every active step', () => {
    const steps = [
      step('a', 0, 0, 'completed'),
      step('b', 1, 1, 'active'),
      step('c', 2, 1, 'active'),
    ];
    expect(activeStepsOf(steps).map((s) => s.uuid)).toEqual(['b', 'c']);
  });

  it('tells a step skipped for its run condition from a disabled one', () => {
    expect(
      isConditionSkipped({
        status: 'skipped',
        skipped_reason: 'condition_not_met',
      } as any),
    ).toBe(true);
    expect(
      isConditionSkipped({ status: 'skipped', skipped_reason: null } as any),
    ).toBe(false);
  });

  it('puts a step running alongside the previous one in its stage', () => {
    const steps = [
      { uuid: 'c', order: 2, parallel_with_previous: true },
      { uuid: 'a', order: 0 },
      { uuid: 'b', order: 1 },
      { uuid: 'd', order: 3 },
    ];
    expect(
      configuredStages(steps).map((stage) => stage.map((s) => s.uuid)),
    ).toEqual([['a'], ['b', 'c'], ['d']]);
    expect(stagePositions(steps).get('c')).toEqual({
      stage: 1,
      size: 2,
      position: 1,
    });
    expect(stagePositions(steps).get('a')).toEqual({
      stage: 0,
      size: 1,
      position: 0,
    });
  });
});

describe('parallelRunAt', () => {
  const rows = ['a', 'b', 'b', 'b', 'c', 'd', 'd'];
  const key = (row: string) => row;

  it('counts the steps of a stage on the first of them', () => {
    expect(parallelRunAt(rows, 1, key)).toBe(3);
    expect(parallelRunAt(rows, 5, key)).toBe(2);
  });

  it('is 0 inside a stage and for a stage of one step', () => {
    expect(parallelRunAt(rows, 2, key)).toBe(0);
    expect(parallelRunAt(rows, 0, key)).toBe(0);
    expect(parallelRunAt(rows, 4, key)).toBe(0);
  });

  it('treats a step without a stage as a stage of its own', () => {
    expect(parallelRunAt([undefined, undefined], 0, (row) => row)).toBe(0);
  });
});

describe('phaseOpenedAt', () => {
  const row = (phase?: string) => ({ phase });

  it('opens each phase on its first step when the steps span phases', () => {
    const rows = [
      row('evaluation'),
      row(),
      row('extension'),
      row('extension'),
      row('closing'),
    ];
    expect(rows.map((_, index) => phaseOpenedAt(rows, index))).toEqual([
      'evaluation',
      null,
      'extension',
      null,
      'closing',
    ]);
  });

  it('opens no phase when every step is in the evaluation', () => {
    const rows = [row('evaluation'), row()];
    expect(phaseOpenedAt(rows, 0)).toBeNull();
  });
});

describe('stageStillOpen', () => {
  const technical = {
    step: 'technical_assessment',
    status: 'completed',
    stage: 2,
    order: 2,
  } as const;
  const panel = { step: 'panel_review', stage: 2, order: 3 } as const;
  const decision = {
    step: 'allocation_decision',
    status: 'pending',
    stage: 4,
    order: 4,
  } as const;

  it('holds while another step of the stage runs', () => {
    const steps = [technical, { ...panel, status: 'active' }, decision];
    expect(stageStillOpen(technical, steps as any, false, 'panel_review')).toBe(
      true,
    );
  });

  it('holds while the stage waits for a manual advance', () => {
    const steps = [technical, { ...panel, status: 'completed' }, decision];
    expect(stageStillOpen(technical, steps as any, true, 'panel_review')).toBe(
      true,
    );
  });

  it('is over once the proposal has moved on', () => {
    const steps = [
      technical,
      { ...panel, status: 'completed' },
      { ...decision, status: 'active' },
    ];
    expect(
      stageStillOpen(technical, steps as any, false, 'allocation_decision'),
    ).toBe(false);
  });
});
