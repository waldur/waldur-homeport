import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceComponentUsagesSetUsage } from 'waldur-js-client';

import { translate } from '@/i18n';

import { getProviderUsageComponents } from './api';
import { ResourceCreateUsageDialog } from './ResourceCreateUsageDialog';

vi.mock('waldur-js-client');
vi.mock('./api');

const props = {
  resolve: {
    resource_name: 'Test resource',
    resource_uuid: 'test-uuid',
    offering_uuid: 'test-offering-uuid',
    customer_name: 'Test customer',
    project_name: 'Test project',
  },
};

const mockData = {
  components: [
    {
      uuid: 'comp-1',
      name: 'Component 1',
      type: 'comp1',
      measured_unit: 'GB',
      description: 'Test component',
    },
  ],

  periods: [
    {
      label: 'January 2024',
      value: {
        uuid: 'period-1',
        plan_name: 'Test Plan',
        plan_uuid: 'plan-1',
        start: '2024-01-01',
        end: '2024-01-31',
        components: [],
      },
    },
  ],
};

const renderDialog = (props) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <ResourceCreateUsageDialog {...props} />
    </QueryClientProvider>,
  );
};

describe('ResourceCreateUsageDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading spinner when data is being fetched', () => {
    vi.mocked(getProviderUsageComponents).mockImplementation(
      () => new Promise(() => {}),
    );
    renderDialog(props);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders error message when API call fails', async () => {
    vi.mocked(getProviderUsageComponents).mockRejectedValue('error');
    renderDialog(props);
    await waitFor(() => {
      expect(
        screen.getByText('Unable to load offering details.'),
      ).toBeInTheDocument();
    });
  });

  it('renders message when there are no components', async () => {
    vi.mocked(getProviderUsageComponents).mockResolvedValue({
      components: [],
      periods: [],
    });
    renderDialog(props);
    await waitFor(() => {
      expect(
        screen.getByText('Offering does not have any usage-based components.'),
      ).toBeInTheDocument();
    });
  });

  it('displays dialog title with resource name', async () => {
    vi.mocked(getProviderUsageComponents).mockResolvedValue({
      components: [],
      periods: [],
    });
    renderDialog(props);
    await waitFor(() => {
      expect(
        screen.getByText(`${translate('Resource usage')} "Test resource"`),
      ).toBeInTheDocument();
    });
  });

  it('displays client organization name', async () => {
    vi.mocked(getProviderUsageComponents).mockResolvedValue(mockData);
    renderDialog(props);
    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Client organization')).toBeInTheDocument();
    expect(
      screen.getByText('Test customer', { exact: false }),
    ).toBeInTheDocument();
  });

  it('submits form with usage values', async () => {
    vi.mocked(getProviderUsageComponents).mockResolvedValue(mockData);
    const submitSpy = vi.mocked(marketplaceComponentUsagesSetUsage);
    submitSpy.mockResolvedValue({} as any);

    renderDialog(props);
    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    const amountInput = screen.getByPlaceholderText('Amount *');
    const descInput = screen.getByPlaceholderText('Enter a description...');
    const submitBtn = screen.getByText('Submit usage report');

    fireEvent.change(amountInput, { target: { value: '10' } });
    fireEvent.change(descInput, { target: { value: 'Test usage' } });

    await act(async () => {
      await fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      expect(submitSpy).toHaveBeenCalledWith({
        body: {
          plan_period: 'period-1',
          usages: [
            {
              type: 'comp1',
              amount: '10',
              description: 'Test usage',
            },
          ],
        },
      });
    });
  });
});
