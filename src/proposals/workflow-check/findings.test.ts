import { describe, expect, it } from 'vitest';
import { WorkflowCheckFinding } from 'waldur-js-client';

import {
  findingTarget,
  findingTrigger,
  findingWhere,
  sortFindings,
  summaryText,
} from './findings';

const finding = (
  values: Partial<WorkflowCheckFinding>,
): WorkflowCheckFinding => ({
  code: 'rule',
  title: 'Rule',
  severity: 'error',
  step: null,
  step_name: null,
  field: null,
  message: 'Message',
  because: [],
  ...values,
});

describe('findingTarget', () => {
  it('opens a step finding on the dialog page holding its field', () => {
    expect(
      findingTarget(finding({ step: 'review', field: 'min_contributions' })),
    ).toEqual({
      kind: 'step',
      step: 'review',
      page: 'participants',
      field: 'min_contributions',
    });
    expect(
      findingTarget(finding({ step: 'review', field: 'run_condition' })),
    ).toMatchObject({ page: 'timing' });
  });

  it('opens a step finding without a field on the first page', () => {
    expect(findingTarget(finding({ step: 'review' }))).toMatchObject({
      kind: 'step',
      page: 'basics',
    });
  });

  it('opens the notification matrix for a notification rule', () => {
    expect(
      findingTarget(finding({ step: 'review', field: 'notification_rules' })),
    ).toEqual({ kind: 'notifications', step: 'review' });
  });

  it('opens the step at its start for a setting the dialog has no page for', () => {
    expect(
      findingTarget(finding({ step: 'review', field: 'not_on_a_page' })),
    ).toEqual({
      kind: 'step',
      step: 'review',
      page: 'basics',
      field: undefined,
    });
  });

  it('opens the tab of a call-level setting', () => {
    expect(findingTarget(finding({ field: 'rounds' }))).toEqual({
      kind: 'call',
      tab: 'rounds',
      page: 'edit',
    });
    expect(findingTarget(finding({ field: 'panels' }))).toEqual({
      kind: 'call',
      tab: 'panels',
      page: 'edit',
    });
    expect(findingTarget(finding({ field: 'budgets' }))).toEqual({
      kind: 'call',
      tab: 'resource-pools',
      page: 'manage',
    });
    expect(findingTarget(finding({ field: 'budget_enforcement' }))).toEqual({
      kind: 'call',
      tab: 'allocation-settings',
      page: 'edit',
    });
    expect(findingTarget(finding({ field: 'nothing_here' }))).toBeUndefined();
  });
});

describe('summaryText', () => {
  it('counts errors and warnings', () => {
    expect(summaryText({ error: 2, warning: 1 })).toBe('2 errors, 1 warning');
    expect(summaryText({ error: 0, warning: 0 })).toBeNull();
  });
});

describe('findingWhere', () => {
  it("names a step finding's step and setting", () => {
    const value = finding({
      step: 'panel',
      step_name: 'Panel meeting',
      field: 'completer',
      message: 'Nobody holds the role.',
    });
    expect(findingWhere(value)).toEqual({
      scope: 'Panel meeting',
      setting: 'Completed by',
    });
  });

  it('places a call finding in the call settings', () => {
    const value = finding({ field: 'rounds', message: 'No round.' });
    expect(findingWhere(value)).toEqual({
      scope: 'Call settings',
      setting: 'Rounds',
    });
  });

  it('spells out a setting it has no label for', () => {
    expect(
      findingWhere(finding({ step: 'panel', field: 'round_scoped' })).setting,
    ).toBe('Round scoped');
  });
});

describe('findingTrigger', () => {
  it('tells two rules of one step apart by their event', () => {
    const rule = (trigger: string) =>
      finding({
        step: 'panel',
        step_name: 'Panel meeting',
        field: 'notification_rules',
        message: 'Nobody is told.',
        because: [
          { source: 'rule', step: 'panel', field: 'trigger', detail: trigger },
        ],
      });
    expect(findingWhere(rule('deadline_approaching')).setting).toBe(
      'Notification rules, on deadline approaching',
    );
    expect(findingTrigger(finding({ step: 'panel' }))).toBeNull();
  });
});

describe('sortFindings', () => {
  it('lists errors, then warnings, then notes', () => {
    const sorted = sortFindings([
      finding({ severity: 'info', code: 'a' }),
      finding({ severity: 'warning', code: 'b' }),
      finding({ severity: 'error', code: 'c' }),
      finding({ severity: 'warning', code: 'd' }),
    ]);
    expect(sorted.map((f) => f.code)).toEqual(['c', 'b', 'd', 'a']);
  });
});
