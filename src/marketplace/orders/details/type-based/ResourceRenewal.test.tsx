import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ResourceRenewal } from './ResourceRenewal';

vi.mock('@/marketplace/common/useShouldConcealPrices', () => ({
  useShouldConcealPrices: () => false,
}));
vi.mock('./OrderCommonFields', async () => {
  const actual = await vi.importActual<any>('./OrderCommonFields');
  return {
    ...actual,
    RequestCommentField: () => null,
  };
});
vi.mock('@/price/PriceTooltip', () => ({
  PriceTooltip: () => null,
}));

const buildOrder = () =>
  ({
    plan_uuid: 'plan-uuid',
    plan_unit: 'month',
    project_uuid: 'project-uuid',
    limits: { gpu: 100 },
    attributes: {
      action: 'renew',
      extension_months: 6,
      old_end_date: '2026-01-01',
      new_end_date: '2026-07-01',
      old_limits: { gpu: 40 },
    },
  }) as any;

const buildOffering = () =>
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
        limit_period: 'month',
      },
    ],
  }) as any;

describe('ResourceRenewal', () => {
  it('uses the monthly total for renewal cost calculation', () => {
    render(<ResourceRenewal order={buildOrder()} offering={buildOffering()} />);

    // Per-month price for 100 GPU hours at 0.5/h = 50; appears in the per-row cell and the total row
    expect(screen.getAllByText(/50\.00/).length).toBeGreaterThanOrEqual(2);
    // Cost for 6 months = 50 × 6 = 300; appears in the per-row cell and the total row
    expect(screen.getAllByText(/300\.00/).length).toBeGreaterThanOrEqual(2);
  });

  it('shows the recorded cost lines, the current term apart from the extension', () => {
    const order = buildOrder();
    order.limits = { gpu: 20 };
    order.attributes = {
      ...order.attributes,
      old_limits: { gpu: 15 },
      cost_lines: [
        {
          component_type: 'gpu',
          term: 'current_term',
          start: '2026-11-25',
          end: '2027-11-25',
          current_limit: '15',
          new_limit: '20',
          quantity: '60.0000000000',
          unit_price: '2.56',
          total: '153.60',
        },
        {
          component_type: 'gpu',
          term: 'extension',
          start: '2027-11-25',
          end: '2028-11-25',
          current_limit: '15',
          new_limit: '20',
          quantity: '240.0000000000',
          unit_price: '2.56',
          total: '614.40',
        },
      ],
    };

    render(<ResourceRenewal order={order} offering={buildOffering()} />);

    expect(screen.getByText(/Rest of current term/)).toBeInTheDocument();
    expect(screen.getByText(/^Extension,/)).toBeInTheDocument();
    expect(screen.getByText(/153\.60/)).toBeInTheDocument();
    expect(screen.getByText(/614\.40/)).toBeInTheDocument();
    // The total is the sum of the lines, not the plan price x months.
    expect(screen.getByText(/768\.00/)).toBeInTheDocument();
  });

  it('takes the quoted volume discount off the total', () => {
    const order = buildOrder();
    order.limits = { gpu: 120 };
    order.attributes = {
      ...order.attributes,
      old_limits: { gpu: 120 },
      cost_lines: [
        {
          component_type: 'gpu',
          term: 'extension',
          start: '2027-11-25',
          end: '2028-11-25',
          current_limit: '120',
          new_limit: '120',
          quantity: '1440.0000000000',
          unit_price: '2.56',
          total: '3686.40',
          discount_percent: '10',
          discount_total: '368.64',
          discount_deferred: false,
        },
      ],
    };

    render(<ResourceRenewal order={order} offering={buildOffering()} />);

    expect(screen.getByText(/3,?686\.40/)).toBeInTheDocument();
    expect(screen.getByText(/368\.64/)).toBeInTheDocument();
    expect(screen.getByText(/10% volume discount/)).toBeInTheDocument();
    // 3686.40 less the discount: what the order costs.
    expect(screen.getByText(/3,?317\.76/)).toBeInTheDocument();
  });

  it('notes a discount that only the invoice can price', () => {
    const order = buildOrder();
    order.attributes = {
      ...order.attributes,
      cost_lines: [
        {
          component_type: 'gpu',
          term: 'extension',
          start: '2027-11-25',
          end: '2028-11-25',
          current_limit: '40',
          new_limit: '100',
          quantity: '600.0000000000',
          unit_price: '0.5',
          total: '300.00',
          discount_percent: '0',
          discount_total: '0',
          discount_deferred: true,
        },
      ],
    };

    render(<ResourceRenewal order={order} offering={buildOffering()} />);

    expect(
      screen.getByText('Volume discount applied on your invoice'),
    ).toBeInTheDocument();
  });

  it('shows no plan price for a renewal recorded with no cost lines', () => {
    const order = buildOrder();
    order.attributes = { ...order.attributes, cost_lines: [] };

    render(<ResourceRenewal order={order} offering={buildOffering()} />);

    // The backend bills nothing for it, so the plan price x months is not
    // shown as its cost.
    expect(screen.queryByText(/300\.00/)).not.toBeInTheDocument();
    expect(screen.getByText(/Total renewal cost/)).toBeInTheDocument();
    expect(screen.getByText(/0\.00/)).toBeInTheDocument();
  });
});
