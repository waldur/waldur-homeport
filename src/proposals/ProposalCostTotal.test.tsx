import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { ProposalCostTotal } from './ProposalCostTotal';

const { isFeatureVisible } = vi.hoisted(() => ({
  isFeatureVisible: vi.fn(() => false),
}));

vi.mock('@/features/connect', () => ({ isFeatureVisible }));

/** A priced prepaid request, the shape sumRequestedResourceCosts reads. */
const prepaidRow = (months: number) => ({
  limits: { gpu_hours: 10 },
  attributes: { prepaid_duration_months: months },
  requested_offering: {
    offering_type: 'Marketplace.Basic',
    components: [
      {
        type: 'gpu_hours',
        billing_type: 'one',
        is_prepaid: true,
        measured_unit: 'h',
      },
    ],
    plan_details: {
      unit: 'month',
      prices: { gpu_hours: 5 },
      init_prices: {},
      future_prices: {},
    },
  },
});

/** A request with no priced plan at all, so nothing can be totalled. */
const unpricedRow = () => ({
  limits: {},
  attributes: {},
  requested_offering: { offering_type: 'Marketplace.Basic', components: [] },
});

afterEach(() => {
  isFeatureVisible.mockReturnValue(false);
});

describe('ProposalCostTotal', () => {
  it('reports the figures and the period when prices are shown', () => {
    renderWithProviders(<ProposalCostTotal rows={[prepaidRow(6)] as any} />);

    expect(screen.getByText('Total:')).toBeInTheDocument();
    expect(screen.getByText('6 months')).toBeInTheDocument();
  });

  it('keeps the period when prices are concealed', () => {
    isFeatureVisible.mockReturnValue(true);
    renderWithProviders(<ProposalCostTotal rows={[prepaidRow(6)] as any} />);

    expect(screen.queryByText('Total:')).not.toBeInTheDocument();
    expect(screen.getByText('6 months')).toBeInTheDocument();
  });

  it('renders nothing when concealing prices leaves no period either', () => {
    // The guard used to pass on the hidden figures alone, so the summary drew
    // its heading over an empty box.
    isFeatureVisible.mockReturnValue(true);
    const { container } = renderWithProviders(
      <ProposalCostTotal rows={[prepaidRow(0)] as any} panel />,
    );

    expect(screen.queryByText('Summary')).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when there is nothing to total', () => {
    const { container } = renderWithProviders(
      <ProposalCostTotal rows={[unpricedRow()] as any} panel />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('names the fixed duration when nothing prepaid was asked for', () => {
    renderWithProviders(
      <ProposalCostTotal
        rows={[unpricedRow()] as any}
        fixedDurationDays={90}
        panel
      />,
    );

    expect(screen.getByText('Project duration:')).toBeInTheDocument();
    expect(screen.getByText('90 days')).toBeInTheDocument();
    expect(screen.queryByText('Total:')).not.toBeInTheDocument();
  });

  // A fixed call duration is the project's length and the ceiling for the
  // subscriptions in it; a 2-month subscription under a 90-day call is still
  // a 90-day project.
  it('lets the fixed duration win over the requested subscription', () => {
    renderWithProviders(
      <ProposalCostTotal
        rows={[prepaidRow(2)] as any}
        fixedDurationDays={90}
      />,
    );

    expect(screen.getByText('90 days')).toBeInTheDocument();
    expect(screen.queryByText('2 months')).not.toBeInTheDocument();
  });

  it('states the fixed duration even before any request is made', () => {
    renderWithProviders(
      <ProposalCostTotal rows={[]} fixedDurationDays={365} panel />,
    );

    expect(screen.getByText('365 days')).toBeInTheDocument();
  });
});
