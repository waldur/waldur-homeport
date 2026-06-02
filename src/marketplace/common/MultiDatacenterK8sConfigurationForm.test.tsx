import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { legacy_createStore as createStore } from 'redux';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { marketplacePublicOfferingsList } from 'waldur-js-client';

import { MultiDatacenterK8sConfigurationForm } from './MultiDatacenterK8sConfigurationForm';

vi.mock('./K8sSecurityConfigSection', () => ({
  K8sSecurityConfigSection: () => (
    <div data-testid="k8s-security-config-section" />
  ),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const store = createStore((state = {}) => state);

describe('MultiDatacenterK8sConfigurationForm', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <MultiDatacenterK8sConfigurationForm
            field={{ type: 'multi_datacenter_k8s_config', label: 'Multi K8s' }}
            input={
              {
                name: 'k8s_multi',
                value: undefined,
                onChange: mockOnChange,
              } as any
            }
          />
        </QueryClientProvider>
      </Provider>,
    );
  };

  it('renders correctly and fetches OpenStack infrastructures', async () => {
    vi.mocked(marketplacePublicOfferingsList).mockResolvedValue({
      data: [
        { uuid: 'infra-1', name: 'OpenStack DC1', customer_name: 'Customer 1' },
      ],
    } as any);

    renderComponent();

    // Verify it loads infrastructures
    await waitFor(() => {
      expect(marketplacePublicOfferingsList).toHaveBeenCalled();
    });

    // Default multi-datacenter config starts with 3 datacenters based on high-availability topology
    expect(screen.getByText('Datacenter 1')).toBeInTheDocument();
    expect(screen.getByText('Datacenter 2')).toBeInTheDocument();
    expect(screen.getByText('Datacenter 3')).toBeInTheDocument();

    // Select infrastructure for Datacenter 1
    const placeholders = screen.getAllByText(
      'Select OpenStack infrastructure...',
    );
    await userEvent.click(placeholders[0]); // Click the placeholder for DC1
    await userEvent.click(screen.getByText('OpenStack DC1 (Customer 1)'));

    // Wait for the onChange to be fired with the infrastructure updated for DC1
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        datacenters: expect.arrayContaining([
          expect.objectContaining({
            id: 'datacenter-1',
            openstack_infrastructure: {
              uuid: 'infra-1',
              name: 'OpenStack DC1',
              customer_name: 'Customer 1',
            },
          }),
        ]),
      }),
    );
  });
});
