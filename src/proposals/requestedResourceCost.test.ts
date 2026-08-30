import { DateTime } from 'luxon';
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

  // Requests saved before the period became a length still carry an end date;
  // it is the only period they have, so it is still priced.
  it('charges a legacy request for the period its end date names', () => {
    // The configure step multiplies a prepaid component by the chosen period
    // and shows the result; this estimate has to agree with it, or the
    // applicant sees one figure while choosing and a smaller one afterwards.
    const prepaid = {
      type: 'cpu_hours',
      name: 'CPU hours',
      billing_type: 'one',
      is_prepaid: true,
      measured_unit: 'hours',
    };
    const sixMonths = DateTime.now().plus({ months: 6 }).toISODate();
    const request = {
      limits: { cpu_hours: 1000 },
      attributes: { end_date: sixMonths },
      requested_offering: {
        offering_type: 'Marketplace.Basic',
        components: [prepaid],
        plan_details: plan('month', { cpu_hours: '2.5' }),
      },
    };

    expect(getRequestedResourceCost(request).oneTime).toBe(15000);

    const { attributes: _period, ...withoutPeriod } = request;
    expect(getRequestedResourceCost(withoutPeriod).oneTime).toBe(2500);
  });

  // A prepaid component is bought for a number of months, and the backend
  // multiplies it by that number at allocation. Pricing one period made a
  // twelve-month request look a twelfth of its size.
  it('multiplies a prepaid component by the months requested', () => {
    const prepaidRow = (attributes?: Record<string, any>) =>
      row({
        limits: { gpu_hours: 100 },
        attributes,
        requested_offering: {
          offering_type: 'Marketplace.Basic',
          components: [
            {
              type: 'gpu_hours',
              name: 'GPU hours',
              billing_type: 'one',
              is_prepaid: true,
              measured_unit: 'h',
            },
          ],
          plan_details: plan('month', { gpu_hours: '1' }),
        },
      });

    expect(
      getRequestedResourceCost(prepaidRow({ prepaid_duration_months: 6 }))
        .oneTime,
    ).toBe(600);
    // Without a duration the request is still worth one period, not nothing.
    expect(getRequestedResourceCost(prepaidRow()).oneTime).toBe(100);
  });

  it('leaves rows without a prepaid component out of the multiplier', () => {
    const cost = getRequestedResourceCost(
      row({ attributes: { prepaid_duration_months: 12 } }),
    );

    expect(cost.monthly).toBe(20);
  });

  // "€15,000.00 one-time" next to a twelve-month request reads as a mistake.
  it('carries the period so the label can name it', () => {
    const prepaid = (months: number) =>
      row({
        limits: { gpu_hours: 100 },
        attributes: { prepaid_duration_months: months },
        requested_offering: {
          offering_type: 'Marketplace.Basic',
          components: [
            {
              type: 'gpu_hours',
              name: 'GPU hours',
              billing_type: 'one',
              is_prepaid: true,
              measured_unit: 'h',
            },
          ],
          plan_details: plan('month', { gpu_hours: '1' }),
        },
      });

    // Per row, which is the only place the label reads it: a sum across rows
    // of different lengths has no period of its own to name.
    expect(getRequestedResourceCost(prepaid(6)).prepaidMonths).toBe(6);
    expect(getRequestedResourceCost(prepaid(12)).prepaidMonths).toBe(12);
    expect(
      sumRequestedResourceCosts([prepaid(6), prepaid(12)]).prepaidMonths,
    ).toBeUndefined();
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
