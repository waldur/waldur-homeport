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
vi.mock('@/core/Tooltip', () => ({
  Tip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
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
});
