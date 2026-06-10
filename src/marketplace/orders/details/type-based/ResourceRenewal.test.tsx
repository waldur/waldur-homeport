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
vi.mock('@/core/Tooltip', () => ({
  Tip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/price/PriceTooltip', () => ({
  PriceTooltip: () => null,
}));
vi.mock('@/resource/summary', () => ({
  Field: ({ value }: { value: any }) => <div>{value}</div>,
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
});
