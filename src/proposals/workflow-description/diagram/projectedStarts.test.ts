import { describe, expect, it } from 'vitest';
import { WorkflowTimelineStep } from 'waldur-js-client';

import { projectedStarts } from './ProposalStepsGantt';

const DAY = 86400000;
const now = Date.parse('2026-10-13T12:00:00Z');
const at = (days: number) => new Date(now + days * DAY).toISOString();

const step = (
  key: string,
  stage: number | null,
  values: Partial<WorkflowTimelineStep>,
): WorkflowTimelineStep => ({
  key,
  name: key,
  stage,
  status: 'pending',
  outcome: null,
  planned_days: null,
  started_at: null,
  completed_at: null,
  deadline: null,
  overdue: false,
  completed_by_name: null,
  sent_notifications: [],
  ...values,
});

describe('projectedStarts', () => {
  it('starts the steps to come after the running step is planned to end', () => {
    const projected = projectedStarts(
      [
        step('check', 0, {
          status: 'completed',
          started_at: at(-20),
          completed_at: at(-15),
        }),
        step('review', 1, {
          status: 'active',
          started_at: at(-5),
          planned_days: 21,
        }),
        step('panel', 2, { planned_days: 14 }),
        step('decision', 3, { planned_days: 7 }),
      ],
      now,
    );
    expect(projected.get('panel')).toBe(now + 16 * DAY);
    expect(projected.get('decision')).toBe(now + 30 * DAY);
    expect(projected.has('check')).toBe(false);
  });

  it('starts them from today once the running step is past its plan', () => {
    const projected = projectedStarts(
      [
        step('review', 0, {
          status: 'active',
          started_at: at(-100),
          planned_days: 21,
        }),
        step('panel', 1, { planned_days: 14 }),
      ],
      now,
    );
    expect(projected.get('panel')).toBe(now);
  });

  it('runs the steps of one stage side by side', () => {
    const projected = projectedStarts(
      [
        step('review', 0, {
          status: 'active',
          started_at: at(-1),
          planned_days: 3,
        }),
        step('a', 1, { planned_days: 10 }),
        step('b', 1, { planned_days: 4 }),
        step('decision', 2, { planned_days: 1 }),
      ],
      now,
    );
    expect(projected.get('a')).toBe(projected.get('b'));
    // The stage ends with its longest step.
    expect(projected.get('decision')).toBe(now + 12 * DAY);
  });

  it('runs steps without a stage one after another', () => {
    const projected = projectedStarts(
      [
        step('review', null, {
          status: 'active',
          started_at: at(-1),
          planned_days: 3,
        }),
        step('panel', null, { planned_days: 14 }),
        step('decision', null, { planned_days: 7 }),
      ],
      now,
    );
    expect(projected.get('panel')).toBe(now + 2 * DAY);
    expect(projected.get('decision')).toBe(now + 16 * DAY);
  });

  it('projects nothing for a proposal that has stopped, nor skipped steps', () => {
    expect(
      projectedStarts(
        [
          step('review', 0, { status: 'withdrawn', started_at: at(-3) }),
          step('panel', 1, { planned_days: 14 }),
        ],
        now,
      ).size,
    ).toBe(0);
    expect(
      projectedStarts(
        [
          step('review', 0, {
            status: 'active',
            started_at: at(-1),
            planned_days: 3,
          }),
          step('tech', 1, { status: 'skipped', planned_days: 10 }),
        ],
        now,
      ).has('tech'),
    ).toBe(false);
  });

  it('plans a proposal waiting for its cut-off from the cut-off', () => {
    const cutoff = now + 60 * DAY;
    const projected = projectedStarts(
      [
        step('check', 0, { planned_days: 7 }),
        step('review', 1, { planned_days: 21 }),
      ],
      now,
      cutoff,
    );
    expect(projected.get('check')).toBe(cutoff);
    expect(projected.get('review')).toBe(cutoff + 7 * DAY);
  });

  it('plans nothing for a waiting proposal without a cut-off', () => {
    expect(
      projectedStarts([step('check', 0, { planned_days: 7 })], now).size,
    ).toBe(0);
  });
});
