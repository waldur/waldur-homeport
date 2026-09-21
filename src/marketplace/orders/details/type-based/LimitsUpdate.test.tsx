import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LimitsUpdate } from './LimitsUpdate';

vi.mock('@/marketplace/common/useShouldConcealPrices', () => ({
  useShouldConcealPrices: () => false,
}));
vi.mock('./OrderCommonFields', async () => {
  const actual = await vi.importActual<any>('./OrderCommonFields');
  return {
    ...actual,
    RequestedByField: () => null,
    RequestCommentField: () => null,
    DescriptionField: () => null,
    CostChangeField: () => null,
  };
});
vi.mock('@/price/PriceTooltip', () => ({
  PriceTooltip: () => null,
}));

const buildOrder = () =>
  ({
    project_uuid: 'project-uuid',
    plan_uuid: 'plan-uuid',
    plan_unit: 'month',
    offering_type: 'Generic',
    limits: { gpu: 100 },
    attributes: { old_limits: { gpu: 40 } },
  }) as any;

const buildOffering = (limitPeriod: string) =>
  ({
    type: 'Generic',
    plans: [
      {
        uuid: 'plan-uuid',
        unit: 'month',
        prices: { gpu: 0.5 },
      },
    ],
    components: [
      {
        type: 'gpu',
        name: 'GPU hours',
        measured_unit: 'h',
        is_boolean: false,
        billing_type: 'limit',
        limit_period: limitPeriod,
      },
    ],
  }) as any;

describe('LimitsUpdate', () => {
  it('appends "one-time" suffix to prices for TOTAL limit_period components', () => {
    render(
      <LimitsUpdate order={buildOrder()} offering={buildOffering('total')} />,
    );

    // Row prices and the totals row all carry the period suffix
    const oneTimeMatches = screen.getAllByText(/one-time/);
    expect(oneTimeMatches.length).toBeGreaterThan(0);
    expect(screen.getByText(/One-time total change/)).toBeInTheDocument();
  });

  it('appends "/mo" suffix to prices for MONTH limit_period components', () => {
    render(
      <LimitsUpdate order={buildOrder()} offering={buildOffering('month')} />,
    );

    expect(screen.getAllByText(/\/mo/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Monthly total change/)).toBeInTheDocument();
  });

  it("prices prepaid components over the resource's real remaining months, instead of always showing 0", () => {
    const sixMonthsOut = new Date();
    sixMonthsOut.setMonth(sixMonthsOut.getMonth() + 6);
    const order = {
      ...buildOrder(),
      resource_end_date: sixMonthsOut.toISOString().slice(0, 10),
    };
    const offering = {
      type: 'Generic',
      plans: [{ uuid: 'plan-uuid', unit: 'month', prices: { gpu: 2 } }],
      components: [
        {
          type: 'gpu',
          name: 'GPU',
          measured_unit: 'h',
          is_boolean: false,
          billing_type: 'one_time',
          is_prepaid: true,
        },
      ],
    } as any;

    render(<LimitsUpdate order={order} offering={offering} />);

    // Without resource_end_date wired through, this always rendered as
    // "Total for remaining 0 months" with every price at 0.
    expect(
      screen.queryByText(/Total for remaining 0 months/),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/Total for remaining [1-9]\d* months/),
    ).toBeInTheDocument();
  });

  it("anchors remaining months to the order's creation date, not to today", () => {
    // 6 months of prepaid subscription, purchased at order.created. The
    // order's own Cost change (backend-computed, frozen at creation) was
    // priced over that full 6. This breakdown must show the same 6, no
    // matter what today's real date is when the test runs -- not a live
    // "months left as of right now" that would only agree with the Cost
    // change figure on the day the order was created.
    //
    // Fixed dates rather than "today plus/minus N months": Date#setMonth()
    // rolls over into the following month when the current day-of-month
    // doesn't exist in the target month (e.g. day 31 landing on a 30-day
    // month), which silently shifted this gap to 7 months on some real
    // calendar days (e.g. Aug 31 or Mar 31) and flaked this exact assertion.
    // The 15th exists in every month, so fixed mid-month dates sidestep the
    // whole class of bug and make the test's result independent of when it
    // actually runs.
    const created = '2026-03-15T00:00:00.000Z';
    const endDate = '2026-09-15';

    const order = {
      ...buildOrder(),
      created,
      resource_end_date: endDate,
    };
    const offering = {
      type: 'Generic',
      plans: [{ uuid: 'plan-uuid', unit: 'month', prices: { gpu: 2 } }],
      components: [
        {
          type: 'gpu',
          name: 'GPU',
          measured_unit: 'h',
          is_boolean: false,
          billing_type: 'one_time',
          is_prepaid: true,
        },
      ],
    } as any;

    render(<LimitsUpdate order={order} offering={offering} />);

    expect(
      screen.getByText(/Total for remaining 6 months/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Total for remaining 3 months/),
    ).not.toBeInTheDocument();
  });
});
