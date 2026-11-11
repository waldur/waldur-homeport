import { describe, expect, it } from 'vitest';

import { TENANT_TYPE } from '@/openstack/constants';

import {
  formatOrderPeriodHint,
  getOrderBillingMonths,
  getOrderPeriodComponentTypes,
  getOrderPeriodResource,
  showsOrderPeriodTotals,
  supportsOrderPeriodTotals,
} from './orderPeriodTotals';

describe('showsOrderPeriodTotals', () => {
  it('is off unless the offering turns it on', () => {
    expect(showsOrderPeriodTotals(undefined)).toBe(false);
    expect(showsOrderPeriodTotals(null)).toBe(false);
    expect(showsOrderPeriodTotals({})).toBe(false);
    expect(showsOrderPeriodTotals({ show_order_period_totals: false })).toBe(
      false,
    );
    expect(showsOrderPeriodTotals({ show_order_period_totals: true })).toBe(
      true,
    );
  });
});

describe('supportsOrderPeriodTotals', () => {
  it('leaves out OpenStack tenants, whose panel shows live quota usage', () => {
    expect(supportsOrderPeriodTotals(TENANT_TYPE)).toBe(false);
    expect(supportsOrderPeriodTotals('Marketplace.Slurm')).toBe(true);
    expect(supportsOrderPeriodTotals(undefined)).toBe(true);
  });
});

describe('formatOrderPeriodHint', () => {
  it('names the months with the right plural', () => {
    expect(formatOrderPeriodHint(1)).toBe('monthly limit × 1 month');
    expect(formatOrderPeriodHint(12)).toBe('monthly limit × 12 months');
  });
});

describe('getOrderPeriodComponentTypes', () => {
  it('keeps monthly limits only, reading an unset period as monthly', () => {
    expect(
      getOrderPeriodComponentTypes([
        { type: 'month', billing_type: 'limit', limit_period: 'month' },
        { type: 'unset', billing_type: 'limit' },
        { type: 'quarter', billing_type: 'limit', limit_period: 'quarterly' },
        { type: 'year', billing_type: 'limit', limit_period: 'annual' },
        { type: 'total', billing_type: 'limit', limit_period: 'total' },
      ] as any),
    ).toEqual(['month', 'unset']);
  });

  it('keeps limit-based components that are not prepaid', () => {
    expect(
      getOrderPeriodComponentTypes([
        { type: 'cpu', billing_type: 'limit', is_prepaid: false },
        { type: 'gpu', billing_type: 'limit', is_prepaid: true },
        { type: 'ram', billing_type: 'one', is_prepaid: true },
        { type: 'storage', billing_type: 'usage' },
      ] as any),
    ).toEqual(['cpu']);
  });
});

describe('getOrderBillingMonths', () => {
  it('counts every billing month the order touches', () => {
    // A mid-month start touches one more billing month than whole months.
    expect(getOrderBillingMonths('2026-06-15T10:00:00Z', '2026-10-14')).toBe(5);
    expect(getOrderBillingMonths('2026-07-01T09:00:00Z', '2027-06-30')).toBe(
      12,
    );
    expect(getOrderBillingMonths('2026-07-15T09:00:00Z', '2027-07-14')).toBe(
      13,
    );
  });

  it('counts at least one month', () => {
    expect(getOrderBillingMonths('2026-07-10T09:00:00Z', '2026-07-20')).toBe(1);
    expect(getOrderBillingMonths('2026-07-10T09:00:00Z', '2026-06-20')).toBe(1);
  });

  it('reads the creation time in UTC, as billing periods are', () => {
    // 30 Jun 23:30 in UTC-3 is already July in UTC.
    expect(
      getOrderBillingMonths('2026-06-30T23:30:00-03:00', '2026-09-30'),
    ).toBe(3);
  });

  it('has no count without both dates', () => {
    expect(getOrderBillingMonths(undefined, '2026-10-14')).toBeUndefined();
    expect(getOrderBillingMonths('2026-06-15T10:00:00Z', null)).toBeUndefined();
  });
});

describe('getOrderPeriodResource', () => {
  const resource = {
    created: '2026-07-01T09:00:00Z',
    end_date: '2027-06-30',
    limits: { cpu: 5000, gpu: 10 },
    limit_usage: { cpu: 1740, gpu: 2 },
  };

  it('sets the order usage against the limit times the months', () => {
    const view = getOrderPeriodResource(
      resource,
      [{ type: 'cpu', usage: 8840 }],
      ['cpu'],
    );
    expect(view.months).toBe(12);
    expect(view.types).toEqual(['cpu']);
    expect(view.resource.limits).toEqual({ cpu: 60000, gpu: 10 });
    expect(view.resource.limit_usage).toEqual({ cpu: 8840, gpu: 2 });
  });

  it('leaves the resource it was given untouched', () => {
    getOrderPeriodResource(resource, [{ type: 'cpu', usage: 8840 }], ['cpu']);
    expect(resource.limits.cpu).toBe(5000);
    expect(resource.limit_usage.cpu).toBe(1740);
  });

  it('keeps a component without a limit unlimited', () => {
    const view = getOrderPeriodResource(
      { ...resource, limits: {} },
      [{ type: 'cpu', usage: 8840 }],
      ['cpu'],
    );
    expect(view.resource.limits).toEqual({});
    expect(view.resource.limit_usage.cpu).toBe(8840);
  });

  it('sets a mid-month order against the billing months it touches', () => {
    // 1,000 a month for 15 Jun - 14 Oct is 5 billing months, not 4.
    const view = getOrderPeriodResource(
      {
        created: '2026-06-15T10:00:00Z',
        end_date: '2026-10-14',
        limits: { cpu: 1000 },
        limit_usage: { cpu: 1000 },
      },
      [{ type: 'cpu', usage: 5000 }],
      ['cpu'],
    );
    expect(view.months).toBe(5);
    expect(view.resource.limits).toEqual({ cpu: 5000 });
    expect(view.resource.limit_usage).toEqual({ cpu: 5000 });
  });

  it('has no order view without an end date', () => {
    expect(
      getOrderPeriodResource({ ...resource, end_date: null }, [], ['cpu']),
    ).toBeUndefined();
  });

  it('totals only the components the offering counts as limit-based', () => {
    // The plan made gpu limit-based, so the backend returns it; the offering
    // does not list it, so it keeps its usual figures and no order label.
    const view = getOrderPeriodResource(
      resource,
      [
        { type: 'cpu', usage: 8840 },
        { type: 'gpu', usage: 9 },
      ],
      ['cpu'],
    );
    expect(view.types).toEqual(['cpu']);
    expect(view.resource.limits).toEqual({ cpu: 60000, gpu: 10 });
    expect(view.resource.limit_usage).toEqual({ cpu: 8840, gpu: 2 });
  });

  it('leaves out a component the backend did not total', () => {
    // The plan made cpu usage-based, so the backend leaves it out.
    const view = getOrderPeriodResource(resource, [], ['cpu']);
    expect(view.types).toEqual([]);
    expect(view.resource.limits).toEqual(resource.limits);
    expect(view.resource.limit_usage).toEqual(resource.limit_usage);
  });

  it('drops the monthly spending limits of the totalled components', () => {
    const view = getOrderPeriodResource(
      {
        ...resource,
        spending_limit_status: [
          { component_type: 'cpu' },
          { component_type: 'credit' },
        ],
      },
      [{ type: 'cpu', usage: 8840 }],
      ['cpu'],
    );
    expect(view.resource.spending_limit_status).toEqual([
      { component_type: 'credit' },
    ]);
  });
});
