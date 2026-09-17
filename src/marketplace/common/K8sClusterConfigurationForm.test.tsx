import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplacePublicOfferingsList } from 'waldur-js-client';

import { K8sClusterConfigurationForm } from './K8sClusterConfigurationForm';
import {
  K8sDefaultConfiguration,
  MultiDatacenterK8sClusterConfig,
} from './multi-datacenter-k8s-types';

vi.mock('./K8sSecurityConfigSection', () => ({
  K8sSecurityConfigSection: () => (
    <div data-testid="k8s-security-config-section" />
  ),
}));

type FieldType = 'single_datacenter_k8s_config' | 'multi_datacenter_k8s_config';

const mockOnChange = vi.fn();

const renderComponent = (
  type: FieldType,
  defaultConfigs?: K8sDefaultConfiguration,
  value?: MultiDatacenterK8sClusterConfig,
) =>
  render(
    <K8sClusterConfigurationForm
      field={
        {
          type,
          label: 'K8s cluster',
          default_configs: defaultConfigs,
        } as any
      }
      input={{ name: 'k8s', value, onChange: mockOnChange } as any}
    />,
  );

const lastValue = (): MultiDatacenterK8sClusterConfig =>
  mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];

const mockInfrastructures = (data: any[] = []) =>
  vi.mocked(marketplacePublicOfferingsList).mockResolvedValue({
    data,
  } as any);

describe('K8sClusterConfigurationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('single_datacenter_k8s_config without a topology mode', () => {
    it('renders one datacenter and fetches OpenStack infrastructures', async () => {
      mockInfrastructures([
        { uuid: 'infra-1', name: 'OpenStack A', customer_name: 'Customer A' },
      ]);

      renderComponent('single_datacenter_k8s_config');

      await waitFor(() => {
        expect(marketplacePublicOfferingsList).toHaveBeenCalled();
      });

      expect(screen.getByText('Datacenter 1')).toBeInTheDocument();
      expect(screen.queryByText('Datacenter 2')).not.toBeInTheDocument();
      expect(screen.getByText('OpenStack infrastructure')).toBeInTheDocument();
      expect(screen.getByText(/Controller nodes/)).toBeInTheDocument();
      expect(screen.getByText('3 controllers')).toBeInTheDocument();
      expect(screen.queryByText('Cluster topology')).not.toBeInTheDocument();

      await userEvent.click(
        screen.getByText('Select OpenStack infrastructure...'),
      );
      await userEvent.click(screen.getByText('OpenStack A (Customer A)'));

      expect(mockOnChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          topology: '1-datacenter',
          datacenters: [
            expect.objectContaining({
              openstack_infrastructure: {
                uuid: 'infra-1',
                name: 'OpenStack A',
                customer_name: 'Customer A',
              },
            }),
          ],
        }),
      );
    });

    it('can add node groups once infrastructure is selected', async () => {
      mockInfrastructures([
        { uuid: 'infra-1', name: 'OpenStack A', customer_name: 'Customer A' },
      ]);

      renderComponent('single_datacenter_k8s_config');

      await waitFor(() => {
        expect(marketplacePublicOfferingsList).toHaveBeenCalled();
      });

      await userEvent.click(
        screen.getByText('Select OpenStack infrastructure...'),
      );
      await userEvent.click(screen.getByText('OpenStack A (Customer A)'));

      const addBtn = await screen.findByRole('button', {
        name: /Add node group/i,
      });
      await userEvent.click(addBtn);

      expect(lastValue().datacenters[0].node_groups).toHaveLength(2);
      expect(lastValue().datacenters[0].node_groups[1]).toEqual(
        expect.objectContaining({ type: 'worker', node_count: 3 }),
      );
    });

    describe('load balancer', () => {
      beforeEach(() => mockInfrastructures());

      // 3 workers + 3 controllers, plus the load balancer when included
      const nodesBadge = (count: number) =>
        screen.queryByText(new RegExp(`^${count} nodes,`));

      it('is mandatory when the offering sets no mode', async () => {
        renderComponent('single_datacenter_k8s_config');

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
        renderComponent('single_datacenter_k8s_config', {
          load_balancer_mode: 'optional',
        });

        const toggle = screen.getByRole('checkbox', {
          name: /Include load balancer/,
        });
        expect(toggle).toBeChecked();
        expect(screen.getByText(/^Load balancer nodes:$/)).toBeInTheDocument();
        expect(nodesBadge(7)).toBeInTheDocument();

        await userEvent.click(toggle);

        expect(
          screen.queryByText(/Load balancer nodes/),
        ).not.toBeInTheDocument();
        expect(nodesBadge(6)).toBeInTheDocument();
        expect(mockOnChange).toHaveBeenLastCalledWith(
          expect.objectContaining({ load_balancer: false }),
        );
      });

      it('is not offered when disabled', async () => {
        renderComponent('single_datacenter_k8s_config', {
          load_balancer_mode: 'disabled',
        });

        expect(
          screen.queryByText(/Load balancer nodes/),
        ).not.toBeInTheDocument();
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

  describe('multi_datacenter_k8s_config without a topology mode', () => {
    it('renders three datacenters and fetches OpenStack infrastructures', async () => {
      mockInfrastructures([
        { uuid: 'infra-1', name: 'OpenStack DC1', customer_name: 'Customer 1' },
      ]);

      renderComponent('multi_datacenter_k8s_config');

      await waitFor(() => {
        expect(marketplacePublicOfferingsList).toHaveBeenCalled();
      });

      expect(screen.getByText('Datacenter 1')).toBeInTheDocument();
      expect(screen.getByText('Datacenter 2')).toBeInTheDocument();
      expect(screen.getByText('Datacenter 3')).toBeInTheDocument();
      expect(screen.queryByText('Cluster topology')).not.toBeInTheDocument();

      const placeholders = screen.getAllByText(
        'Select OpenStack infrastructure...',
      );
      await userEvent.click(placeholders[0]);
      await userEvent.click(screen.getByText('OpenStack DC1 (Customer 1)'));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          topology: '3-datacenter',
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
      expect(lastValue().datacenters).toHaveLength(3);
    });

    describe('load balancer', () => {
      beforeEach(() => mockInfrastructures());

      it('shows one mandatory load balancer per datacenter by default', () => {
        renderComponent('multi_datacenter_k8s_config');

        expect(
          screen.getAllByText(/Load balancer nodes \(Mandatory\)/),
        ).toHaveLength(3);
      });

      it('drops the load balancer from every datacenter at once', async () => {
        renderComponent('multi_datacenter_k8s_config', {
          load_balancer_mode: 'optional',
        });

        expect(screen.getAllByText(/^Load balancer nodes:$/)).toHaveLength(3);
        // 3 workers + 1 controller + 1 load balancer per datacenter
        expect(screen.getAllByText(/^5 nodes,/)).toHaveLength(3);

        await userEvent.click(
          screen.getByRole('checkbox', { name: /Include load balancer/ }),
        );

        expect(
          screen.queryByText(/Load balancer nodes/),
        ).not.toBeInTheDocument();
        expect(screen.getAllByText(/^4 nodes,/)).toHaveLength(3);
        expect(mockOnChange).toHaveBeenLastCalledWith(
          expect.objectContaining({ load_balancer: false }),
        );
      });

      it('is not offered when disabled', () => {
        renderComponent('multi_datacenter_k8s_config', {
          load_balancer_mode: 'disabled',
        });

        expect(
          screen.queryByText(/Load balancer nodes/),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole('checkbox', { name: /Include load balancer/ }),
        ).not.toBeInTheDocument();
        expect(screen.getAllByText(/^4 nodes,/)).toHaveLength(3);
      });
    });
  });

  describe('fixed topology mode', () => {
    beforeEach(() => mockInfrastructures());

    it('shows three sites for a single-datacenter option set to 3-datacenter', async () => {
      renderComponent('single_datacenter_k8s_config', {
        topology_mode: '3-datacenter',
      });

      expect(screen.getByText('Datacenter 3')).toBeInTheDocument();
      expect(screen.getAllByText('1 controller')).toHaveLength(3);
      expect(screen.queryByText('Cluster topology')).not.toBeInTheDocument();
      await waitFor(() =>
        expect(lastValue()).toEqual(
          expect.objectContaining({ topology: '3-datacenter' }),
        ),
      );
      expect(lastValue().datacenters).toHaveLength(3);
    });

    it('shows one site for a multi-datacenter option set to 1-datacenter', async () => {
      renderComponent('multi_datacenter_k8s_config', {
        topology_mode: '1-datacenter',
      });

      expect(screen.getByText('Datacenter 1')).toBeInTheDocument();
      expect(screen.queryByText('Datacenter 2')).not.toBeInTheDocument();
      expect(screen.getByText('3 controllers')).toBeInTheDocument();
      await waitFor(() =>
        expect(lastValue()).toEqual(
          expect.objectContaining({ topology: '1-datacenter' }),
        ),
      );
      expect(lastValue().datacenters).toHaveLength(1);
    });
  });

  describe('customer_choice topology mode', () => {
    beforeEach(() => mockInfrastructures());

    const chooseTopology = async (label: string) => {
      await userEvent.click(screen.getByText(/Single site|Three sites/));
      await userEvent.click(screen.getByText(label));
    };

    it('lets the customer switch between one and three sites', async () => {
      renderComponent('single_datacenter_k8s_config', {
        topology_mode: 'customer_choice',
        available_kubernetes_versions: '1.30.0',
        load_balancer_mode: 'optional',
      });

      expect(screen.getByText('Cluster topology')).toBeInTheDocument();
      // Starts from the option type's topology.
      expect(
        screen.getByText('Single site, 3 controllers'),
      ).toBeInTheDocument();
      expect(screen.queryByText('Datacenter 2')).not.toBeInTheDocument();
      // 3 workers + 3 controllers + 1 load balancer
      expect(screen.getByText(/^7 nodes,/)).toBeInTheDocument();

      await userEvent.click(
        screen.getByRole('checkbox', { name: /Install Longhorn/ }),
      );
      await userEvent.click(
        screen.getByRole('checkbox', { name: /Include load balancer/ }),
      );
      await chooseTopology('Three sites, 1 controller each');

      expect(screen.getByText('Datacenter 3')).toBeInTheDocument();
      expect(screen.getAllByText('1 controller')).toHaveLength(3);
      // 3 workers + 1 controller per site, load balancer still off
      expect(screen.getAllByText(/^4 nodes,/)).toHaveLength(3);
      expect(
        screen.getByText(/Datacenters were reset for the new topology/),
      ).toBeInTheDocument();
      expect(lastValue()).toEqual(
        expect.objectContaining({
          topology: '3-datacenter',
          kubernetes_version: '1.30.0',
          install_longhorn: true,
          load_balancer: false,
        }),
      );
      expect(lastValue().datacenters).toHaveLength(3);

      await chooseTopology('Single site, 3 controllers');

      expect(screen.queryByText('Datacenter 2')).not.toBeInTheDocument();
      expect(screen.getByText('3 controllers')).toBeInTheDocument();
      expect(lastValue()).toEqual(
        expect.objectContaining({
          topology: '1-datacenter',
          install_longhorn: true,
          load_balancer: false,
        }),
      );
      expect(lastValue().datacenters).toHaveLength(1);
    });

    it('resets the per-site node groups on a switch', async () => {
      mockInfrastructures([
        { uuid: 'infra-1', name: 'OpenStack A', customer_name: 'Customer A' },
      ]);
      renderComponent('multi_datacenter_k8s_config', {
        topology_mode: 'customer_choice',
      });

      await waitFor(() => {
        expect(marketplacePublicOfferingsList).toHaveBeenCalled();
      });
      // A multi-datacenter option starts with three sites.
      expect(screen.getByText('Datacenter 3')).toBeInTheDocument();

      await userEvent.click(
        screen.getAllByText('Select OpenStack infrastructure...')[0],
      );
      await userEvent.click(screen.getByText('OpenStack A (Customer A)'));
      expect(lastValue().datacenters[0].openstack_infrastructure).toBeDefined();

      await chooseTopology('Single site, 3 controllers');

      expect(lastValue().datacenters).toEqual([
        expect.objectContaining({
          id: 'datacenter-1',
          node_groups: [expect.objectContaining({ id: 'dc1-worker-1' })],
        }),
      ]);
      expect(
        lastValue().datacenters[0].openstack_infrastructure,
      ).toBeUndefined();
    });

    it('keeps the stored pick', () => {
      renderComponent(
        'single_datacenter_k8s_config',
        { topology_mode: 'customer_choice' },
        {
          kubernetes_version: '1.30.0',
          topology: '3-datacenter',
          datacenters: [1, 2, 3].map((i) => ({
            id: `datacenter-${i}`,
            name: `Datacenter ${i}`,
            node_groups: [],
          })),
        },
      );

      expect(
        screen.getByText('Three sites, 1 controller each'),
      ).toBeInTheDocument();
      expect(screen.getByText('Datacenter 3')).toBeInTheDocument();
      expect(
        screen.queryByText(/Datacenters were reset/),
      ).not.toBeInTheDocument();
    });
  });

  describe('stored value', () => {
    beforeEach(() => mockInfrastructures());

    const storedCluster = (
      count: number,
      topology?: MultiDatacenterK8sClusterConfig['topology'],
    ): MultiDatacenterK8sClusterConfig =>
      ({
        kubernetes_version: '1.30.0',
        ...(topology ? { topology } : {}),
        load_balancer: true,
        datacenters: Array.from({ length: count }, (_, i) => ({
          id: `datacenter-${i + 1}`,
          name: `Datacenter ${i + 1}`,
          openstack_infrastructure: {
            uuid: `infra-${i + 1}`,
            name: `OpenStack ${i + 1}`,
            customer_name: 'Customer',
          },
          node_groups: [
            {
              id: `dc${i + 1}-worker-1`,
              type: 'worker' as const,
              node_count: 5,
              disk_config: { system_disk_size_gb: 20, data_disk_size_gb: 200 },
            },
          ],
        })),
      }) as MultiDatacenterK8sClusterConfig;

    const warning =
      /configured with a different topology than the offering now allows/;

    it('is kept unchanged when it fits the offering', async () => {
      renderComponent(
        'multi_datacenter_k8s_config',
        undefined,
        storedCluster(3, '3-datacenter'),
      );

      await waitFor(() =>
        expect(marketplacePublicOfferingsList).toHaveBeenCalled(),
      );
      expect(screen.getByText('Datacenter 3')).toBeInTheDocument();
      expect(screen.queryByText(warning)).not.toBeInTheDocument();
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it.each([
      [
        'a fixed mode',
        'single_datacenter_k8s_config' as const,
        { topology_mode: '1-datacenter' as const },
      ],
      ['the option type', 'single_datacenter_k8s_config' as const, undefined],
      [
        'a fixed mode on a multi-datacenter option',
        'multi_datacenter_k8s_config' as const,
        { topology_mode: '1-datacenter' as const },
      ],
    ])(
      'keeps a three-site cluster that %s no longer allows',
      async (_, type, defaultConfigs) => {
        const stored = storedCluster(3, '3-datacenter');
        renderComponent(type, defaultConfigs, stored);

        await waitFor(() =>
          expect(marketplacePublicOfferingsList).toHaveBeenCalled(),
        );
        expect(screen.getByText(warning)).toBeInTheDocument();
        // Rendered with its own topology: three sites, one controller each.
        expect(screen.getByText('Datacenter 3')).toBeInTheDocument();
        expect(screen.getAllByText('1 controller')).toHaveLength(3);
        expect(
          screen.queryByText(/Datacenters were reset/),
        ).not.toBeInTheDocument();
        expect(mockOnChange).not.toHaveBeenCalled();
      },
    );

    it('keeps a legacy value without topology, inferring it from its sites', async () => {
      renderComponent(
        'single_datacenter_k8s_config',
        { topology_mode: '1-datacenter' },
        storedCluster(3),
      );

      await waitFor(() =>
        expect(marketplacePublicOfferingsList).toHaveBeenCalled(),
      );
      expect(screen.getByText(warning)).toBeInTheDocument();
      expect(screen.getByText('Datacenter 3')).toBeInTheDocument();
      // Only the inferred topology is added; the sites are untouched.
      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(lastValue()).toEqual({
        ...storedCluster(3),
        topology: '3-datacenter',
      });
    });

    it('lets the customer move a mismatched cluster to an allowed topology', async () => {
      renderComponent(
        'single_datacenter_k8s_config',
        { topology_mode: 'customer_choice' },
        storedCluster(2, '3-datacenter'),
      );

      expect(screen.getByText(warning)).toBeInTheDocument();
      expect(mockOnChange).not.toHaveBeenCalled();

      await userEvent.click(screen.getByText('Three sites, 1 controller each'));
      await userEvent.click(screen.getByText('Single site, 3 controllers'));

      expect(screen.queryByText(warning)).not.toBeInTheDocument();
      expect(screen.getByText(/Datacenters were reset/)).toBeInTheDocument();
      expect(lastValue().topology).toBe('1-datacenter');
      expect(lastValue().datacenters).toHaveLength(1);
    });
  });
});
