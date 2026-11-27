import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplacePublicOfferingsK8sSitesRetrieve,
  marketplacePublicOfferingsList,
} from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import {
  K8sDefaultConfiguration,
  MultiDatacenterK8sClusterConfig,
} from './k8s-types';
import { K8sClusterConfigurationForm } from './K8sClusterConfigurationForm';

vi.mock('./K8sSecurityConfigSection', () => ({
  K8sSecurityConfigSection: () => (
    <div data-testid="k8s-security-config-section" />
  ),
}));

const mockOnChange = vi.fn();

const renderComponent = (
  defaultConfigs?: K8sDefaultConfiguration,
  value?: MultiDatacenterK8sClusterConfig,
) =>
  render(
    <K8sClusterConfigurationForm
      field={
        {
          type: 'k8s_cluster_config',
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

  describe('single-site topology mode', () => {
    it('renders one datacenter and fetches OpenStack infrastructures', async () => {
      mockInfrastructures([
        { uuid: 'infra-1', name: 'OpenStack A', customer_name: 'Customer A' },
      ]);

      renderComponent({ topology_mode: '1-datacenter' });

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

      renderComponent({ topology_mode: '1-datacenter' });

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
        renderComponent({ topology_mode: '1-datacenter' });

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
        renderComponent({
          topology_mode: '1-datacenter',
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
        renderComponent({
          topology_mode: '1-datacenter',
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

  describe('three-site topology mode', () => {
    it('renders three datacenters and fetches OpenStack infrastructures', async () => {
      mockInfrastructures([
        { uuid: 'infra-1', name: 'OpenStack DC1', customer_name: 'Customer 1' },
      ]);

      renderComponent({ topology_mode: '3-datacenter' });

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
        renderComponent({ topology_mode: '3-datacenter' });

        expect(
          screen.getAllByText(/Load balancer nodes \(Mandatory\)/),
        ).toHaveLength(3);
      });

      it('drops the load balancer from every datacenter at once', async () => {
        renderComponent({
          topology_mode: '3-datacenter',
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
        renderComponent({
          topology_mode: '3-datacenter',
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

    it('shows three sites when set to 3-datacenter', async () => {
      renderComponent({
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

    it('shows one site when set to 1-datacenter', async () => {
      renderComponent({
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

  describe('no topology mode', () => {
    it('lets the customer choose, starting with one site', async () => {
      mockInfrastructures();
      renderComponent();

      await waitFor(() =>
        expect(marketplacePublicOfferingsList).toHaveBeenCalled(),
      );
      expect(
        screen.getByText('Single site, 3 controllers'),
      ).toBeInTheDocument();
      expect(screen.getByText('Datacenter 1')).toBeInTheDocument();
      expect(screen.queryByText('Datacenter 2')).not.toBeInTheDocument();
    });
  });

  describe('customer_choice topology mode', () => {
    beforeEach(() => mockInfrastructures());

    const chooseTopology = async (label: string) => {
      await userEvent.click(screen.getByText(/Single site|Three sites/));
      await userEvent.click(screen.getByText(label));
    };

    it('lets the customer switch between one and three sites', async () => {
      renderComponent({
        topology_mode: 'customer_choice',
        available_kubernetes_versions: '1.30.0',
        load_balancer_mode: 'optional',
      });

      expect(screen.getByText('Cluster topology')).toBeInTheDocument();
      // A fresh form starts with a single site.
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
      // Nothing the customer chose for the sites was discarded.
      expect(
        screen.queryByText(/Datacenters were reset for the new topology/),
      ).not.toBeInTheDocument();
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
      renderComponent({
        topology_mode: 'customer_choice',
      });

      await waitFor(() => {
        expect(marketplacePublicOfferingsList).toHaveBeenCalled();
      });
      await chooseTopology('Three sites, 1 controller each');
      expect(screen.getByText('Datacenter 3')).toBeInTheDocument();

      await userEvent.click(
        screen.getAllByText('Select OpenStack infrastructure...')[0],
      );
      await userEvent.click(screen.getByText('OpenStack A (Customer A)'));
      expect(lastValue().datacenters[0].openstack_infrastructure).toBeDefined();

      await chooseTopology('Single site, 3 controllers');

      expect(
        screen.getByText(/Datacenters were reset for the new topology/),
      ).toBeInTheDocument();
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
        { topology_mode: '3-datacenter' },
        storedCluster(3, '3-datacenter'),
      );

      await waitFor(() =>
        expect(marketplacePublicOfferingsList).toHaveBeenCalled(),
      );
      expect(screen.getByText('Datacenter 3')).toBeInTheDocument();
      expect(screen.queryByText(warning)).not.toBeInTheDocument();
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('keeps a three-site cluster that a single-site mode no longer allows', async () => {
      const stored = storedCluster(3, '3-datacenter');
      renderComponent({ topology_mode: '1-datacenter' }, stored);

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
    });

    it('keeps a legacy value without topology, inferring it from its sites', async () => {
      renderComponent({ topology_mode: '1-datacenter' }, storedCluster(3));

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

  describe('sites fixed by the provider', () => {
    const SITES = [
      { uuid: 'tallinn', name: 'Tallinn' },
      { uuid: 'tartu', name: 'Tartu' },
      { uuid: 'narva', name: 'Narva' },
    ];
    const commonFlavor = (name: string, cores: number, ramGb: number) => ({
      name,
      cores,
      ram: ramGb * 1024,
      disk: 20480,
      sites: SITES.map((site) => ({
        offering_uuid: site.uuid,
        flavor_uuid: `${site.uuid}-${name}`,
      })),
    });
    const FLAVORS = [commonFlavor('small', 1, 2), commonFlavor('large', 8, 32)];

    const mockSites = (topology: string) => {
      const count = topology === '1-datacenter' ? 1 : 3;
      return {
        sites: SITES.slice(0, count),
        flavors: FLAVORS.map((flavor) => ({
          ...flavor,
          sites: flavor.sites.slice(0, count),
        })),
      };
    };

    beforeEach(() => {
      vi.mocked(marketplacePublicOfferingsK8sSitesRetrieve).mockImplementation(
        ({ query }) =>
          Promise.resolve({ data: mockSites(query.topology) }) as any,
      );
    });

    const renderFixed = (
      defaultConfigs: K8sDefaultConfiguration,
      value?: MultiDatacenterK8sClusterConfig,
    ) =>
      renderWithProviders(
        <K8sClusterConfigurationForm
          field={
            {
              type: 'k8s_cluster_config',
              label: 'K8s cluster',
              default_configs: {
                infrastructure_mode: 'provider_fixed',
                available_kubernetes_versions: '1.30.0',
                ...defaultConfigs,
              },
            } as any
          }
          optionName="cluster"
          offeringUuid="k8s-offering"
          input={{ name: 'k8s', value, onChange: mockOnChange } as any}
        />,
      );

    it('shows the sites read-only instead of an infrastructure selector', async () => {
      renderFixed({ topology_mode: '3-datacenter' });

      expect(await screen.findByText('Tallinn')).toBeInTheDocument();
      expect(screen.getByText('Tartu')).toBeInTheDocument();
      expect(screen.getByText('Narva')).toBeInTheDocument();
      expect(screen.getAllByText('Site:')).toHaveLength(3);
      expect(
        screen.queryByText('OpenStack infrastructure'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Select OpenStack infrastructure...'),
      ).not.toBeInTheDocument();
      expect(marketplacePublicOfferingsList).not.toHaveBeenCalled();
      expect(marketplacePublicOfferingsK8sSitesRetrieve).toHaveBeenCalledWith({
        path: { uuid: 'k8s-offering' },
        query: { option: 'cluster', topology: '3-datacenter' },
      });

      // Node groups are edited once and repeated read-only on the others.
      expect(screen.getByText('Node groups (all sites)')).toBeInTheDocument();
      expect(
        screen.getAllByRole('button', { name: /Add node group/ }),
      ).toHaveLength(1);
      expect(
        screen.getAllByText(
          'The same node groups as Datacenter 1, with the flavors of this site.',
        ),
      ).toHaveLength(2);

      await waitFor(() =>
        expect(
          lastValue().datacenters.map((dc) => dc.openstack_infrastructure),
        ).toEqual(SITES),
      );
    });

    it('mirrors the node groups with every site its own flavor', async () => {
      renderFixed({
        topology_mode: '3-datacenter',
        minimal_worker_vcpus: 2,
        minimal_worker_ram_gb: 4,
      });
      await screen.findByText('Tallinn');

      await userEvent.click(
        screen.getByRole('button', { name: /Select\.\.\./ }),
      );
      const { openDialog } = vi.mocked(useModal)();
      const [, dialogProps] = vi.mocked(openDialog).mock.calls[0] as any;
      // The picker lists the flavors every site has, not one offering's own.
      expect(dialogProps.resolve.commonFlavors).toEqual({
        key: 'k8s-offering-cluster-3-datacenter',
        flavors: mockSites('3-datacenter').flavors,
      });
      expect(dialogProps.resolve.offeringUuid).toBe('tallinn');
      expect(dialogProps.resolve.allSites).toBe(true);

      act(() =>
        dialogProps.resolve.onFlavorSelect({
          uuid: 'tallinn-large',
          name: 'large',
          vcpus: 8,
          ram: 32768,
          disk: 20480,
        }),
      );
      await userEvent.click(
        screen.getByRole('button', { name: /Add node group/ }),
      );

      const { datacenters } = lastValue();
      expect(datacenters).toHaveLength(3);
      datacenters.forEach((datacenter, index) => {
        expect(datacenter.openstack_infrastructure).toEqual(SITES[index]);
        expect(datacenter.node_groups).toHaveLength(2);
        expect(datacenter.node_groups[0].openstack_flavor).toEqual({
          uuid: `${SITES[index].uuid}-large`,
          name: 'large',
          vcpus: 8,
          ram: 32768,
          disk: 20480,
        });
      });
      // The same groups everywhere, apart from ids and flavor UUIDs.
      const shape = (dc) =>
        dc.node_groups.map((group) => ({
          type: group.type,
          node_count: group.node_count,
          disk_config: group.disk_config,
          flavor: group.openstack_flavor?.name,
        }));
      expect(shape(datacenters[1])).toEqual(shape(datacenters[0]));
      expect(shape(datacenters[2])).toEqual(shape(datacenters[0]));
      expect(datacenters[1].node_groups[0].id).toBe('dc2-worker-1');

      // The picked flavor on the first site, and in each other site's list.
      expect(screen.getAllByText('large')).toHaveLength(3);
    });

    it('fetches the sites of the new topology on a switch', async () => {
      renderFixed({ topology_mode: 'customer_choice' });
      expect(await screen.findByText('Tallinn')).toBeInTheDocument();
      expect(screen.queryByText('Tartu')).not.toBeInTheDocument();

      await userEvent.click(screen.getByText('Single site, 3 controllers'));
      await userEvent.click(screen.getByText('Three sites, 1 controller each'));

      expect(await screen.findByText('Narva')).toBeInTheDocument();
      expect(
        marketplacePublicOfferingsK8sSitesRetrieve,
      ).toHaveBeenLastCalledWith({
        path: { uuid: 'k8s-offering' },
        query: { option: 'cluster', topology: '3-datacenter' },
      });
      await waitFor(() =>
        expect(
          lastValue().datacenters.map((dc) => dc.openstack_infrastructure),
        ).toEqual(SITES),
      );
    });

    it('leaves a stored cluster on the sites unchanged', async () => {
      const value: MultiDatacenterK8sClusterConfig = {
        kubernetes_version: '1.30.0',
        topology: '1-datacenter',
        load_balancer: true,
        datacenters: [
          {
            id: 'datacenter-1',
            name: 'Datacenter 1',
            openstack_infrastructure: SITES[0],
            node_groups: [
              {
                id: 'dc1-worker-1',
                type: 'worker',
                node_count: 3,
                openstack_flavor: {
                  uuid: 'tallinn-large',
                  name: 'large',
                  vcpus: 8,
                  ram: 32768,
                  disk: 20480,
                },
                disk_config: {
                  system_disk_size_gb: 20,
                  data_disk_size_gb: 100,
                },
              },
            ],
          },
        ],
      };
      renderFixed({ topology_mode: '1-datacenter' }, value);

      expect(await screen.findByText('Tallinn')).toBeInTheDocument();
      expect(screen.getByText('large')).toBeInTheDocument();
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    const storedOnSites = (
      sites: typeof SITES,
      topology: MultiDatacenterK8sClusterConfig['topology'],
    ): MultiDatacenterK8sClusterConfig => ({
      kubernetes_version: '1.30.0',
      topology,
      load_balancer: true,
      datacenters: sites.map((site, index) => ({
        id: `datacenter-${index + 1}`,
        name: `Datacenter ${index + 1}`,
        openstack_infrastructure: site,
        node_groups: [
          {
            id: `dc${index + 1}-worker-1`,
            type: 'worker' as const,
            node_count: 3,
            openstack_flavor: {
              uuid: `${site.uuid}-large`,
              name: 'large',
              vcpus: 8,
              ram: 32768,
              disk: 20480,
            },
            disk_config: { system_disk_size_gb: 20, data_disk_size_gb: 100 },
          },
        ],
      })),
    });

    it('keeps a stored cluster on sites the provider has since changed', async () => {
      const value = storedOnSites(
        [{ uuid: 'old-site', name: 'Old site' }],
        '1-datacenter',
      );
      renderFixed({ topology_mode: '1-datacenter' }, value);

      expect(
        await screen.findByText(
          'This cluster runs on other sites than the service provider now offers.',
        ),
      ).toBeInTheDocument();
      expect(screen.getByText('Old site')).toBeInTheDocument();
      expect(screen.queryByText('Tallinn')).not.toBeInTheDocument();
      // Read-only: its node groups cannot be changed on the old sites.
      expect(
        screen.queryByRole('button', { name: /Add node group/ }),
      ).not.toBeInTheDocument();
      expect(mockOnChange).not.toHaveBeenCalled();

      await userEvent.click(
        screen.getByRole('button', { name: 'Move to the current sites' }),
      );

      expect(lastValue().datacenters).toEqual([
        expect.objectContaining({
          openstack_infrastructure: SITES[0],
          node_groups: [
            expect.objectContaining({
              node_count: 3,
              openstack_flavor: expect.objectContaining({
                uuid: 'tallinn-large',
              }),
            }),
          ],
        }),
      ]);
      expect(
        screen.queryByText(
          'This cluster runs on other sites than the service provider now offers.',
        ),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Add node group/ }),
      ).toBeInTheDocument();
    });

    it('does not look up the sites of a topology the option no longer offers', () => {
      renderFixed(
        { topology_mode: '1-datacenter' },
        storedOnSites(SITES, '3-datacenter'),
      );

      expect(
        screen.getByText(
          'This cluster was configured with a different topology than the offering now allows.',
        ),
      ).toBeInTheDocument();
      expect(screen.getByText('Narva')).toBeInTheDocument();
      expect(
        screen.queryByText('Unable to load the sites of this offering.'),
      ).not.toBeInTheDocument();
      expect(marketplacePublicOfferingsK8sSitesRetrieve).not.toHaveBeenCalled();
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('says the node groups were reset only when some were defined', async () => {
      renderFixed({ topology_mode: 'customer_choice' });
      await screen.findByText('Tallinn');

      await userEvent.click(screen.getByText('Single site, 3 controllers'));
      await userEvent.click(screen.getByText('Three sites, 1 controller each'));
      expect(await screen.findByText('Narva')).toBeInTheDocument();
      expect(
        screen.queryByText(/Define the node groups again/),
      ).not.toBeInTheDocument();

      await userEvent.click(
        screen.getByRole('button', { name: /Add node group/ }),
      );
      await userEvent.click(screen.getByText('Three sites, 1 controller each'));
      await userEvent.click(screen.getByText('Single site, 3 controllers'));
      expect(
        screen.getByText(/Define the node groups again/),
      ).toBeInTheDocument();
    });

    it('shows why the sites cannot be loaded', async () => {
      vi.mocked(marketplacePublicOfferingsK8sSitesRetrieve).mockRejectedValue({
        topology: ['The provider has not set the sites of this topology.'],
      });
      renderFixed({ topology_mode: '1-datacenter' });

      expect(
        await screen.findByText('Unable to load the sites of this offering.'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/The provider has not set the sites of this topology/),
      ).toBeInTheDocument();
      expect(screen.queryByText('Datacenter 1')).not.toBeInTheDocument();
    });
  });
});
