import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ResourceLimitChangeInfo } from './ResourceLimitChangeInfo';

// Stub heavy presentational dependencies — we want to assert on the period-aware
// suffix wired into the table cells, not the surrounding order summary chrome.
vi.mock('@/marketplace/orders/details/OrderDetailsQuickBody', () => ({
  OrderDetailsQuickBody: () => null,
}));
vi.mock('@/marketplace/orders/details/OrderStateField', () => ({
  OrderStateField: () => null,
}));
vi.mock('@/marketplace/service-providers/dashboard/ChangesAmountBadge', () => ({
  ChangesAmountBadge: ({ changes }: { changes: number }) => (
    <span data-testid="badge">{changes}</span>
  ),
}));
vi.mock('@/core/Tooltip', () => ({
  Tip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('./CostEstimatedChangeView', () => ({
  CostEstimatedChangeView: () => null,
}));

const buildResource = () =>
  ({
    end_date: null,
    order_in_progress: {
      uuid: 'order-uuid',
      created_by_full_name: 'Alice',
      created_by_username: 'alice',
      created: '2026-01-15T00:00:00Z',
      state: 'pending-consumer',
      plan_unit: 'month',
      plan_uuid: 'plan-uuid',
      limits: { gpu: 100 },
    },
    limits: { gpu: 40 },
    current_usages: { gpu: 0 },
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

describe('ResourceLimitChangeInfo', () => {
  it('renders one Impact column with one-time suffix for TOTAL limit_period', () => {
    render(
      <ResourceLimitChangeInfo
        resource={buildResource()}
        offering={buildOffering('total')}
      />,
    );

    // Single Impact column header (the multi-period day/30/365 split is gone)
    const impactHeaders = screen.getAllByText(/^Impact$/);
    expect(impactHeaders).toHaveLength(1);

    // The TOTAL-period total row carries the one-time suffix
    expect(screen.getByText(/One-time total/)).toBeInTheDocument();
    expect(screen.getAllByText(/one-time/).length).toBeGreaterThan(0);
  });

  it('renders monthly suffix for MONTH limit_period', () => {
    render(
      <ResourceLimitChangeInfo
        resource={buildResource()}
        offering={buildOffering('month')}
      />,
    );

    expect(screen.getByText(/Monthly total/)).toBeInTheDocument();
    expect(screen.getAllByText(/\/mo/).length).toBeGreaterThan(0);
  });
});
