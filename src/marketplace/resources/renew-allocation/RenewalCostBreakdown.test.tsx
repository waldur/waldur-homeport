import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { RenewalCostBreakdown } from './RenewalCostBreakdown';
import { useRenewalEstimate } from './useRenewalEstimate';

vi.mock('./useRenewalEstimate', () => ({ useRenewalEstimate: vi.fn() }));
vi.mock('@tanstack/react-query', async () => ({
  ...(await vi.importActual<any>('@tanstack/react-query')),
  useQuery: () => ({ data: null }),
}));
vi.mock('@/features/connect', () => ({ isFeatureVisible: () => false }));

const extension = {
  component_type: 'storage',
  component_name: 'Storage',
  billing_type: 'prepaid',
  billing_period: null,
  term: 'extension',
  current_limit: 120,
  new_limit: 120,
  unit_price: '2.56',
  measured_unit: 'TB',
  period_description: '12 months',
  period_start: '2027-11-25',
  period_end: '2028-11-25',
  quantity: '1440',
  total: '3686.40',
  discount_percent: '0',
  discount_total: '0',
  discount_deferred: false,
};

const estimate = (overrides: Record<string, any>, line = {}) =>
  ({
    data: {
      components: [{ ...extension, ...line }],
      subscription_total: '3686.40',
      limit_change_total: '0',
      discount_total: '0',
      discount_deferred: false,
      total: '3686.40',
      remaining_days: 365,
      paid_up_end_date: '2027-11-25',
      new_end_date: '2028-11-25',
      ...overrides,
    },
    isLoading: false,
  }) as any;

const renderBreakdown = () =>
  render(
    <RenewalCostBreakdown
      resource={{ project_uuid: null } as any}
      extensionMonths={12}
    />,
  );

describe('RenewalCostBreakdown', () => {
  it('shows a quoted volume discount under its line and in the total', () => {
    vi.mocked(useRenewalEstimate).mockReturnValue(
      estimate(
        { discount_total: '368.64', total: '3317.76' },
        { discount_percent: '10', discount_total: '368.64' },
      ),
    );

    renderBreakdown();

    expect(screen.getByText(/10% volume discount/)).toBeInTheDocument();
    expect(screen.getByText(/368\.64/)).toBeInTheDocument();
    expect(screen.getByText(/3,?317\.76/)).toBeInTheDocument();
  });

  it('notes a discount that is applied on the invoice', () => {
    vi.mocked(useRenewalEstimate).mockReturnValue(
      estimate({ discount_deferred: true }, { discount_deferred: true }),
    );

    renderBreakdown();

    expect(
      screen.getByText('Volume discount applied on your invoice'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/volume discount$/)).not.toBeInTheDocument();
  });

  it('shows no discount when there is none', () => {
    vi.mocked(useRenewalEstimate).mockReturnValue(estimate({}));

    renderBreakdown();

    expect(screen.queryByText(/volume discount/i)).not.toBeInTheDocument();
  });

  it('takes the discount off the subscription subtotal', () => {
    vi.mocked(useRenewalEstimate).mockReturnValue(
      estimate({
        components: [
          { ...extension, discount_percent: '10', discount_total: '368.64' },
          {
            ...extension,
            component_type: 'cpu',
            component_name: 'CPU',
            billing_type: 'limit',
            billing_period: 'month',
            term: null,
            total: '100',
            discount_total: '0',
          },
        ],
        limit_change_total: '100',
        discount_total: '368.64',
        total: '3417.76',
      }),
    );

    renderBreakdown();

    // 3686.40 less 368.64, so the subtotals add up to the total.
    expect(screen.getByText(/3,?317\.76/)).toBeInTheDocument();
    expect(screen.getByText(/3,?417\.76/)).toBeInTheDocument();
  });

  it('rounds the percent and still shows a fully discounted renewal', () => {
    vi.mocked(useRenewalEstimate).mockReturnValue(
      estimate(
        { discount_total: '3686.40', total: '0' },
        {
          discount_percent: '33.333333333333336',
          discount_total: '3686.40',
        },
      ),
    );

    renderBreakdown();

    expect(screen.getByText(/33\.33% volume discount/)).toBeInTheDocument();
  });
});
