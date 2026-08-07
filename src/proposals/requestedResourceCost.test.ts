import { describe, expect, it } from 'vitest';

import {
  getRequestedResourceCost,
  sumRequestedResourceCosts,
} from './requestedResourceCost';

const plan = (unit: string, prices: Record<string, string>) => ({
  unit,
  prices,
  quotas: {},
  components: [],
});

const limitComponent = (type: string, limit_period = 'month') => ({
  type,
  name: type,
  billing_type: 'limit',
  limit_period,
  measured_unit: 'unit',
});

const row = (overrides: Record<string, any> = {}) => ({
  limits: { cpu: 2 },
  requested_offering: {
    offering_type: 'Marketplace.Basic',
    components: [limitComponent('cpu')],
    plan_details: plan('month', { cpu: '10' }),
  },
  ...overrides,
});

describe('requested resource cost', () => {
  it('prices limits against the plan', () => {
    const cost = getRequestedResourceCost(row());

    expect(cost.known).toBe(true);
    expect(cost.monthly).toBe(20);
  });

  // An unpriced request must not render as "0.00", which reads as free.
  it('reports unknown rather than zero when the call pinned no plan', () => {
    const cost = getRequestedResourceCost(
      row({
        requested_offering: {
          offering_type: 'Marketplace.Basic',
          components: [limitComponent('cpu')],
          plan_details: undefined,
        },
      }),
    );

    expect(cost.known).toBe(false);
    expect(cost.monthly).toBe(0);
  });

  // Requests written before limits moved to their own field.
  it('falls back to the legacy limits inside attributes', () => {
    const cost = getRequestedResourceCost(
      row({ limits: {}, attributes: { limits: { cpu: 3 } } }),
    );

    expect(cost.monthly).toBe(30);
  });

  // Rows priced per day and per month cannot be added up as they stand.
  it('normalises to a month so rows in different units can be summed', () => {
    const daily = row({
      limits: { cpu: 1 },
      requested_offering: {
        offering_type: 'Marketplace.Basic',
        components: [limitComponent('cpu')],
        plan_details: plan('day', { cpu: '1' }),
      },
    });

    expect(getRequestedResourceCost(daily).monthly).toBe(30);
    expect(sumRequestedResourceCosts([row(), daily]).monthly).toBe(50);
  });

  // Attaching an offering creates a request with no amounts yet. Pricing it at
  // zero made an unfinished request look like a priced one.
  it('reports unknown when the request names no amount at all', () => {
    const cost = getRequestedResourceCost(row({ limits: {}, attributes: {} }));

    expect(cost.known).toBe(false);
  });

  // A grant's whole core-hour award is charged once, not every month.
  it('files a total-period limit as one-time rather than recurring', () => {
    const cost = getRequestedResourceCost(
      row({
        limits: { cpu: 100000 },
        requested_offering: {
          offering_type: 'Marketplace.Basic',
          components: [limitComponent('cpu', 'total')],
          plan_details: plan('month', { cpu: '0.05' }),
        },
      }),
    );

    expect(cost.oneTime).toBe(5000);
    expect(cost.monthly).toBe(0);
  });

  it('stays unknown only when not one row could be priced', () => {
    const unpriced = row({
      requested_offering: {
        offering_type: 'Marketplace.Basic',
        components: [],
        plan_details: undefined,
      },
    });

    expect(sumRequestedResourceCosts([unpriced]).known).toBe(false);
    expect(sumRequestedResourceCosts([unpriced, row()]).known).toBe(true);
  });
});
