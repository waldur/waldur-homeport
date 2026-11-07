import { describe, expect, it } from 'vitest';
import { CallOfferingComponentBounds } from 'waldur-js-client';

import {
  canAllocateInSubmissionOrder,
  findComponentRule,
  fixedRuleComponents,
  formatAmount,
  formatBudgetAmount,
  formatComponentUnit,
  formatRuleBounds,
  getRuleBoundsValidator,
  getWaitingRefusal,
} from './budgets';

const rule = (
  overrides: Partial<CallOfferingComponentBounds>,
): CallOfferingComponentBounds => ({
  uuid: 'r1',
  requested_offering_uuid: 'ro1',
  component_type: 'cpu',
  measured_unit: 'core-hours',
  limit_period: 'total',
  min_per_proposal: null,
  max_per_proposal: null,
  default_amount: null,
  is_fixed: false,
  ...overrides,
});

describe('getRuleBoundsValidator', () => {
  it('checks nothing without a rule, for a fixed amount or without bounds', () => {
    expect(getRuleBoundsValidator(undefined)).toBeUndefined();
    expect(
      getRuleBoundsValidator(rule({ is_fixed: true, default_amount: 50 })),
    ).toBeUndefined();
    expect(getRuleBoundsValidator(rule({}))).toBeUndefined();
  });

  it('refuses an amount outside the bounds and names them', () => {
    const validate = getRuleBoundsValidator(
      rule({ min_per_proposal: 10, max_per_proposal: 200 }),
    );
    const message =
      'Outside what the call allows. Between 10 core-hours and 200 core-hours.';
    expect(validate(5)).toBe(message);
    expect(validate('201')).toBe(message);
    expect(validate(10)).toBeUndefined();
    expect(validate(200)).toBeUndefined();
    expect(validate('50')).toBeUndefined();
  });

  it('lets an empty amount through, as the offering minimum does', () => {
    const validate = getRuleBoundsValidator(rule({ min_per_proposal: 10 }));
    expect(validate(undefined)).toBeUndefined();
    expect(validate(null)).toBeUndefined();
    expect(validate('')).toBeUndefined();
  });

  it('checks a one-sided rule against its one side', () => {
    expect(getRuleBoundsValidator(rule({ min_per_proposal: 10 }))(5)).toBe(
      'Outside what the call allows. At least 10 core-hours.',
    );
    expect(getRuleBoundsValidator(rule({ max_per_proposal: 200 }))(201)).toBe(
      'Outside what the call allows. At most 200 core-hours.',
    );
    expect(
      getRuleBoundsValidator(rule({ max_per_proposal: 200 }))(0),
    ).toBeUndefined();
  });
});

describe('findComponentRule', () => {
  it('matches the rule of the offering and component', () => {
    const other = rule({ requested_offering_uuid: 'ro2' });
    const own = rule({});
    expect(findComponentRule([other, own], 'ro1', 'cpu')).toBe(own);
    expect(findComponentRule([other], 'ro1', 'cpu')).toBeUndefined();
    expect(findComponentRule([own], 'ro1', 'ram')).toBeUndefined();
    expect(findComponentRule(undefined, 'ro1', 'cpu')).toBeUndefined();
  });
});

describe('fixedRuleComponents', () => {
  it('lists the components of the offering the call fixes', () => {
    const rules = [
      rule({ is_fixed: true, default_amount: 5 }),
      rule({ component_type: 'ram' }),
      rule({
        requested_offering_uuid: 'ro2',
        component_type: 'gpu',
        is_fixed: true,
      }),
    ];
    expect([...fixedRuleComponents(rules, 'ro1')]).toEqual(['cpu']);
    expect(fixedRuleComponents(undefined, 'ro1').size).toBe(0);
  });
});

describe('formatRuleBounds', () => {
  it('states the bounds with the unit', () => {
    expect(
      formatRuleBounds(rule({ min_per_proposal: 10, max_per_proposal: 200 })),
    ).toBe('Between 10 core-hours and 200 core-hours.');
    expect(formatRuleBounds(rule({ max_per_proposal: 200 }))).toBe(
      'At most 200 core-hours.',
    );
    expect(formatRuleBounds(rule({ min_per_proposal: 10 }))).toBe(
      'At least 10 core-hours.',
    );
    expect(formatRuleBounds(rule({ default_amount: 50, is_fixed: true }))).toBe(
      'Fixed at 50 core-hours.',
    );
    expect(formatRuleBounds(rule({}))).toBeUndefined();
    expect(formatRuleBounds(undefined)).toBeUndefined();
  });
});

describe('formatComponentUnit', () => {
  it('names the period of a periodic limit', () => {
    expect(formatComponentUnit('GB', 'month')).toBe('GB per month');
    expect(formatComponentUnit('hours', 'total')).toBe('hours');
    expect(formatComponentUnit('', 'annual')).toBe('per year');
  });
});

describe('formatAmount', () => {
  it('adds the unit when there is one', () => {
    expect(formatAmount(40, 'TB')).toBe('40 TB');
    expect(formatAmount(40)).toBe('40');
    expect(formatAmount(null, 'TB')).toBe('');
  });
});

describe('formatBudgetAmount', () => {
  it('reads an unset total as unlimited', () => {
    expect(formatBudgetAmount(null)).toBe('Unlimited');
    expect(formatBudgetAmount(40)).toBe('40');
  });
});

describe('canAllocateInSubmissionOrder', () => {
  it('offers it after the cut-off until the round is completed', () => {
    expect(
      canAllocateInSubmissionOrder({ status: 'ended', lifecycle_state: null }),
    ).toBe(true);
    expect(
      canAllocateInSubmissionOrder({
        status: 'ended',
        lifecycle_state: 'deciding',
      }),
    ).toBe(true);
    expect(
      canAllocateInSubmissionOrder({
        status: 'ended',
        lifecycle_state: 'closed',
      }),
    ).toBe(false);
    expect(
      canAllocateInSubmissionOrder({ status: 'open', lifecycle_state: null }),
    ).toBe(false);
  });
});

describe('getWaitingRefusal', () => {
  it('reads the count of proposals still before the decision', () => {
    expect(
      getWaitingRefusal({
        status: 400,
        waiting_count: 2,
        detail: 'Wait for them.',
      }),
    ).toEqual({ count: 2, detail: 'Wait for them.' });
    expect(getWaitingRefusal({ status: 400, detail: 'Other' })).toBeNull();
    expect(getWaitingRefusal({ status: 403, waiting_count: 2 })).toBeNull();
  });
});
