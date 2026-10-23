import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PerOfferingBarsWidget } from './PerOfferingBarsWidget';

vi.mock('@/core/utils', () => ({ getBrandColor: () => '#307300' }));
vi.mock('@/dashboard/chartColors', () => ({
  getChartThemeColors: () => ({ muted: '#667085' }),
}));

const mockComponent = (overrides = {}) => ({
  type: 'node',
  name: 'Compute',
  description: '',
  measured_unit: 'node hours',
  billing_type: 'limit',
  usage: 0,
  limit_usage: 140,
  usage_terminated: 0,
  limit_usage_terminated: 0,
  limit: 1000,
  offering_name: 'HPC',
  offering_uuid: 'abc',
  limit_period: 'quarterly',
  current_period_label: 'Q2 2026',
  current_period_start: '2026-04-01',
  current_period_end: '2026-06-30',
  ...overrides,
});

describe('PerOfferingBarsWidget', () => {
  it('renders nothing when there are no components', () => {
    const { container } = render(
      <PerOfferingBarsWidget
        data={{ components: [] }}
        isLoading={false}
        error={null}
        refetch={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the chart without component type select when there is only one type', () => {
    render(
      <PerOfferingBarsWidget
        data={{ components: [mockComponent()] }}
        isLoading={false}
        error={null}
        refetch={vi.fn()}
      />,
    );
    expect(screen.getByTestId('echart')).toBeInTheDocument();
    expect(screen.queryByText('Component type:')).not.toBeInTheDocument();
  });

  it('renders a Select dropdown when there are multiple component types', async () => {
    const components = [
      mockComponent({ type: 'node', name: 'Compute' }),
      mockComponent({ type: 'storage', name: 'Storage', measured_unit: 'GB' }),
    ];

    render(
      <PerOfferingBarsWidget
        data={{ components }}
        isLoading={false}
        error={null}
        refetch={vi.fn()}
      />,
    );

    expect(screen.getByText('Component type:')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    // Open the dropdown and verify options
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));

    const storageOption = screen.getByText('Storage');
    expect(storageOption).toBeInTheDocument();

    await user.click(storageOption);
    expect(screen.getByText('Storage')).toBeInTheDocument();
  });
});
