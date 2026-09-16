import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplacePublicOfferingsList } from 'waldur-js-client';

import { K8sDefaultConfiguration } from './multi-datacenter-k8s-types';
import { MultiDatacenterK8sConfigurationForm } from './MultiDatacenterK8sConfigurationForm';

vi.mock('./K8sSecurityConfigSection', () => ({
  K8sSecurityConfigSection: () => (
    <div data-testid="k8s-security-config-section" />
  ),
}));

describe('MultiDatacenterK8sConfigurationForm', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (defaultConfigs?: K8sDefaultConfiguration) => {
    return render(
      <MultiDatacenterK8sConfigurationForm
        field={
          {
            type: 'multi_datacenter_k8s_config',
            label: 'Multi K8s',
            default_configs: defaultConfigs,
          } as any
        }
        input={
          {
            name: 'k8s_multi',
            value: undefined,
            onChange: mockOnChange,
          } as any
        }
      />,
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

  describe('load balancer', () => {
    beforeEach(() => {
      vi.mocked(marketplacePublicOfferingsList).mockResolvedValue({
        data: [],
      } as any);
    });

    it('shows one mandatory load balancer per datacenter by default', () => {
      renderComponent();

      expect(
        screen.getAllByText(/Load balancer nodes \(Mandatory\)/),
      ).toHaveLength(3);
    });

    it('drops the load balancer from every datacenter at once', async () => {
      renderComponent({ load_balancer_mode: 'optional' });

      expect(screen.getAllByText(/^Load balancer nodes:$/)).toHaveLength(3);
      // 3 workers + 1 controller + 1 load balancer per datacenter
      expect(screen.getAllByText(/^5 nodes,/)).toHaveLength(3);

      await userEvent.click(
        screen.getByRole('checkbox', { name: /Include load balancer/ }),
      );

      expect(screen.queryByText(/Load balancer nodes/)).not.toBeInTheDocument();
      expect(screen.getAllByText(/^4 nodes,/)).toHaveLength(3);
      expect(mockOnChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ load_balancer: false }),
      );
    });

    it('is not offered when disabled', () => {
      renderComponent({ load_balancer_mode: 'disabled' });

      expect(screen.queryByText(/Load balancer nodes/)).not.toBeInTheDocument();
      expect(
        screen.queryByRole('checkbox', { name: /Include load balancer/ }),
      ).not.toBeInTheDocument();
      expect(screen.getAllByText(/^4 nodes,/)).toHaveLength(3);
    });
  });
});
