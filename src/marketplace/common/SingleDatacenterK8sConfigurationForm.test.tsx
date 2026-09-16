import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplacePublicOfferingsList } from 'waldur-js-client';

import { K8sDefaultConfiguration } from './multi-datacenter-k8s-types';
import { SingleDatacenterK8sConfigurationForm } from './SingleDatacenterK8sConfigurationForm';

vi.mock('./K8sSecurityConfigSection', () => ({
  K8sSecurityConfigSection: () => (
    <div data-testid="k8s-security-config-section" />
  ),
}));

describe('SingleDatacenterK8sConfigurationForm', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (defaultConfigs?: K8sDefaultConfiguration) => {
    return render(
      <SingleDatacenterK8sConfigurationForm
        field={
          {
            type: 'single_datacenter_k8s_config',
            label: 'Single K8s',
            default_configs: defaultConfigs,
          } as any
        }
        input={{ name: 'k8s', value: undefined, onChange: mockOnChange } as any}
      />,
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

  describe('load balancer', () => {
    beforeEach(() => {
      vi.mocked(marketplacePublicOfferingsList).mockResolvedValue({
        data: [],
      } as any);
    });

    // 3 workers + 3 controllers, plus the load balancer when included
    const nodesBadge = (count: number) =>
      screen.queryByText(new RegExp(`^${count} nodes,`));

    it('is mandatory when the offering sets no mode', async () => {
      renderComponent();

      expect(
        screen.getByText(/Load balancer nodes \(Mandatory\)/),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('checkbox', { name: /Include load balancer/ }),
      ).not.toBeInTheDocument();
      expect(nodesBadge(7)).toBeInTheDocument();
      await waitFor(() =>
        expect(mockOnChange).toHaveBeenLastCalledWith(
          expect.objectContaining({ load_balancer: true }),
        ),
      );
    });

    it('can be switched off when optional', async () => {
      renderComponent({ load_balancer_mode: 'optional' });

      const toggle = screen.getByRole('checkbox', {
        name: /Include load balancer/,
      });
      expect(toggle).toBeChecked();
      expect(screen.getByText(/^Load balancer nodes:$/)).toBeInTheDocument();
      expect(nodesBadge(7)).toBeInTheDocument();

      await userEvent.click(toggle);

      expect(screen.queryByText(/Load balancer nodes/)).not.toBeInTheDocument();
      expect(nodesBadge(6)).toBeInTheDocument();
      expect(mockOnChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ load_balancer: false }),
      );
    });

    it('is not offered when disabled', async () => {
      renderComponent({ load_balancer_mode: 'disabled' });

      expect(screen.queryByText(/Load balancer nodes/)).not.toBeInTheDocument();
      expect(
        screen.queryByRole('checkbox', { name: /Include load balancer/ }),
      ).not.toBeInTheDocument();
      expect(nodesBadge(6)).toBeInTheDocument();
      await waitFor(() =>
        expect(mockOnChange).toHaveBeenLastCalledWith(
          expect.objectContaining({ load_balancer: false }),
        ),
      );
    });
  });
});
