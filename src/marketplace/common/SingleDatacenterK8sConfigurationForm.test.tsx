import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { legacy_createStore as createStore } from 'redux';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { marketplacePublicOfferingsList } from 'waldur-js-client';

import { SingleDatacenterK8sConfigurationForm } from './SingleDatacenterK8sConfigurationForm';

vi.mock('./K8sSecurityConfigSection', () => ({
  K8sSecurityConfigSection: () => (
    <div data-testid="k8s-security-config-section" />
  ),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const store = createStore((state = {}) => state);

describe('SingleDatacenterK8sConfigurationForm', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <SingleDatacenterK8sConfigurationForm
            field={{
              type: 'single_datacenter_k8s_config',
              label: 'Single K8s',
            }}
            input={
              { name: 'k8s', value: undefined, onChange: mockOnChange } as any
            }
          />
        </QueryClientProvider>
      </Provider>,
    );
  };

  it('renders and fetches OpenStack infrastructures', async () => {
    vi.mocked(marketplacePublicOfferingsList).mockResolvedValue({
      data: [
        { uuid: 'infra-1', name: 'OpenStack A', customer_name: 'Customer A' },
      ],
    } as any);

    renderComponent();

    // Verify it loads infrastructures
    await waitFor(() => {
      expect(marketplacePublicOfferingsList).toHaveBeenCalled();
    });

    // Verify UI skeleton
    expect(screen.getByText('Datacenter 1')).toBeInTheDocument();
    expect(screen.getByText('OpenStack infrastructure')).toBeInTheDocument();
    expect(screen.getByText(/Controller nodes/)).toBeInTheDocument();

    // Select infrastructure (Wait for it to be enabled and pick the correct one)
    await waitFor(() => {
      expect(
        screen.getByText('Select OpenStack infrastructure...'),
      ).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByText('Select OpenStack infrastructure...'),
    );
    await userEvent.click(screen.getByText('OpenStack A (Customer A)'));

    // Wait for the onChange to be fired with the infrastructure updated
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        datacenters: expect.arrayContaining([
          expect.objectContaining({
            openstack_infrastructure: {
              uuid: 'infra-1',
              name: 'OpenStack A',
              customer_name: 'Customer A',
            },
          }),
        ]),
      }),
    );
  });

  it('can add node groups once infrastructure is selected', async () => {
    vi.mocked(marketplacePublicOfferingsList).mockResolvedValue({
      data: [
        { uuid: 'infra-1', name: 'OpenStack A', customer_name: 'Customer A' },
      ],
    } as any);

    renderComponent();

    await waitFor(() => {
      expect(marketplacePublicOfferingsList).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(
        screen.getByText('Select OpenStack infrastructure...'),
      ).toBeInTheDocument();
    });

    // Select infrastructure to reveal node groups
    await userEvent.click(
      screen.getByText('Select OpenStack infrastructure...'),
    );
    await userEvent.click(screen.getByText('OpenStack A (Customer A)'));

    // Click 'Add node group'
    const addBtn = await screen.findByRole('button', {
      name: /Add node group/i,
    });
    await userEvent.click(addBtn);

    // After clicking, onChange should be triggered with a new node group
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        datacenters: expect.arrayContaining([
          expect.objectContaining({
            node_groups: expect.arrayContaining([
              expect.objectContaining({
                id: expect.stringMatching(/worker-/),
                type: 'worker',
                node_count: 3,
              }),
            ]),
          }),
        ]),
      }),
    );
  });
});
