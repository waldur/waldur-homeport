import { describe, expect, it } from 'vitest';

import {
  calculateTotalClusterResources,
  changeClusterTopology,
  cleanFixedSitesPolicy,
  createDefaultClusterConfig,
  filterCommonFlavors,
  getAllowedTopologies,
  getFixedSitesState,
  getNewNodeGroupId,
  hasSiteChoices,
  meetsWorkerMinimums,
  getInfrastructureMode,
  getInitialClusterConfig,
  getInitialTopology,
  getSiteFlavor,
  getTopologyMode,
  hasLoadBalancer,
  isK8sConfigFieldType,
  isProviderFixed,
  isTopologyAllowed,
  mirrorFixedSiteDatacenters,
  validateFixedSites,
  validateMultiDatacenterConfiguration,
} from './k8s-types';

describe('createDefaultClusterConfig', () => {
  it('preselects the first version the offering advertises', () => {
    const config = createDefaultClusterConfig('1-datacenter', {
      available_kubernetes_versions: '1.30.0, 1.31.0',
    });

    expect(config.kubernetes_version).toBe('1.30.0');
  });

  it('leaves the version unset when the offering advertises none', () => {
    // A hardcoded fallback would leave the select showing its placeholder (the
    // value is not among its options) while the form silently holds a version
    // the offering does not support.
    const config = createDefaultClusterConfig('1-datacenter');

    expect(config.kubernetes_version).toBe('');
    expect(validateMultiDatacenterConfiguration(config)).toContain(
      'Kubernetes version must be selected',
    );
  });

  it('creates one datacenter per topology slot', () => {
    expect(createDefaultClusterConfig('1-datacenter').datacenters).toHaveLength(
      1,
    );
    expect(createDefaultClusterConfig('3-datacenter').datacenters).toHaveLength(
      3,
    );
  });
});

describe('load balancer mode', () => {
  it('keeps the load balancer when the offering sets no mode', () => {
    expect(hasLoadBalancer({})).toBe(true);
    expect(hasLoadBalancer({ load_balancer: false })).toBe(true);
    expect(createDefaultClusterConfig('1-datacenter').load_balancer).toBe(true);
  });

  it('lets the customer drop the load balancer when it is optional', () => {
    const configs = { load_balancer_mode: 'optional' as const };
    expect(hasLoadBalancer({}, configs)).toBe(true);
    expect(hasLoadBalancer({ load_balancer: true }, configs)).toBe(true);
    expect(hasLoadBalancer({ load_balancer: false }, configs)).toBe(false);
    expect(
      createDefaultClusterConfig('1-datacenter', configs).load_balancer,
    ).toBe(true);
  });

  it('never adds a load balancer when it is disabled', () => {
    const configs = { load_balancer_mode: 'disabled' as const };
    expect(hasLoadBalancer({ load_balancer: true }, configs)).toBe(false);
    expect(
      createDefaultClusterConfig('3-datacenter', configs).load_balancer,
    ).toBe(false);
  });

  it('treats an order value without the flag as having a load balancer', () => {
    const { load_balancer: _, ...legacy } =
      createDefaultClusterConfig('1-datacenter');

    expect(
      getInitialClusterConfig('1-datacenter', legacy, {
        load_balancer_mode: 'optional',
      }).load_balancer,
    ).toBe(true);
  });

  it('settles a stale flag against the offering mode', () => {
    const config = {
      ...createDefaultClusterConfig('1-datacenter'),
      load_balancer: false,
    };

    expect(getInitialClusterConfig('1-datacenter', config).load_balancer).toBe(
      true,
    );
  });

  it.each([
    ['1-datacenter' as const, 1],
    ['3-datacenter' as const, 3],
  ])(
    'counts load balancers in the %s totals only when included',
    (topology, expected) => {
      const configs = {
        load_balancer_mode: 'optional' as const,
        default_lb_vcpus: 5,
        default_lb_ram_gb: 7,
      };
      const withLb = createDefaultClusterConfig(topology, configs);
      const withoutLb = { ...withLb, load_balancer: false };

      const included = calculateTotalClusterResources(withLb, configs);
      const excluded = calculateTotalClusterResources(withoutLb, configs);

      expect(included.totalLoadBalancerNodes).toBe(expected);
      expect(excluded.totalLoadBalancerNodes).toBe(0);
      expect(included.totalNodes - excluded.totalNodes).toBe(expected);
      expect(included.totalVCpus - excluded.totalVCpus).toBe(5 * expected);
      expect(included.totalRam - excluded.totalRam).toBe(7 * expected);
    },
  );
});

describe('Kubernetes option type', () => {
  it('recognises only the cluster type', () => {
    expect(isK8sConfigFieldType('k8s_cluster_config')).toBe(true);
    expect(isK8sConfigFieldType('single_datacenter_k8s_config')).toBe(false);
    expect(isK8sConfigFieldType('k8s_egress_rules')).toBe(false);
    expect(isK8sConfigFieldType(undefined)).toBe(false);
  });
});

describe('topology mode', () => {
  it('lets the customer choose when the offering sets no mode', () => {
    expect(getTopologyMode()).toBe('customer_choice');
    expect(getTopologyMode({})).toBe('customer_choice');
    expect(getTopologyMode({ topology_mode: '3-datacenter' })).toBe(
      '3-datacenter',
    );
  });

  it('ignores a stored topology under a fixed mode', () => {
    expect(
      getInitialTopology(
        { topology: '3-datacenter' },
        { topology_mode: '1-datacenter' },
      ),
    ).toBe('1-datacenter');
  });

  it('keeps the customer pick, starting a fresh form with a single site', () => {
    const configs = { topology_mode: 'customer_choice' as const };
    expect(getInitialTopology({ topology: '3-datacenter' }, configs)).toBe(
      '3-datacenter',
    );
    expect(getInitialTopology(undefined, configs)).toBe('1-datacenter');
    expect(getInitialTopology(undefined)).toBe('1-datacenter');
  });

  it('rebuilds the sites and keeps cluster-wide choices on a switch', () => {
    const config = {
      ...createDefaultClusterConfig('1-datacenter', {
        available_kubernetes_versions: '1.31.0',
      }),
      install_longhorn: true,
      load_balancer: false,
      public_access_rules: [{ cidr: '10.0.0.0/8' }],
    };

    const switched = changeClusterTopology(config, '3-datacenter');

    expect(switched.topology).toBe('3-datacenter');
    expect(switched.datacenters.map((dc) => dc.id)).toEqual([
      'datacenter-1',
      'datacenter-2',
      'datacenter-3',
    ]);
    expect(switched.kubernetes_version).toBe('1.31.0');
    expect(switched.install_longhorn).toBe(true);
    expect(switched.load_balancer).toBe(false);
    expect(switched.public_access_rules).toEqual([{ cidr: '10.0.0.0/8' }]);
  });

  it('keeps a stored config whose topology the offering no longer uses', () => {
    const stored = createDefaultClusterConfig('3-datacenter');

    const config = getInitialClusterConfig('1-datacenter', stored);

    expect(config.topology).toBe('3-datacenter');
    expect(config.datacenters).toBe(stored.datacenters);
    expect(
      isTopologyAllowed(config, {
        topology_mode: '1-datacenter',
      }),
    ).toBe(false);
  });

  it('infers the topology of a stored config from its sites', () => {
    const { topology: _, ...legacy } =
      createDefaultClusterConfig('3-datacenter');

    expect(
      getInitialClusterConfig('1-datacenter', legacy as any).topology,
    ).toBe('3-datacenter');
  });

  it('builds sites for a stored value that has none', () => {
    const config = getInitialClusterConfig('3-datacenter', {
      kubernetes_version: '1.29.0',
    } as any);

    expect(config.topology).toBe('3-datacenter');
    expect(config.datacenters).toHaveLength(3);
    expect(config.kubernetes_version).toBe('1.29.0');
  });

  it.each([
    // [mode, topology, datacenter count, allowed]
    [undefined, '1-datacenter', 1, true],
    [undefined, '3-datacenter', 3, true],
    [undefined, '1-datacenter', 3, false],
    ['1-datacenter', '3-datacenter', 3, false],
    ['3-datacenter', '3-datacenter', 3, true],
    ['customer_choice', '3-datacenter', 3, true],
    ['customer_choice', '1-datacenter', 1, true],
    ['customer_choice', '1-datacenter', 3, false],
    ['1-datacenter', '1-datacenter', 2, false],
  ] as const)(
    'checks mode %s against a %s config of %i site(s)',
    (mode, topology, count, allowed) => {
      const config = {
        topology,
        datacenters: createDefaultClusterConfig(
          '3-datacenter',
        ).datacenters.slice(0, count),
      };
      expect(
        isTopologyAllowed(config, mode ? { topology_mode: mode } : {}),
      ).toBe(allowed);
    },
  );

  it('keeps a stored config that predates the topology key', () => {
    const { topology: _, ...legacy } = {
      ...createDefaultClusterConfig('1-datacenter'),
      kubernetes_version: '1.29.0',
    };

    const config = getInitialClusterConfig('1-datacenter', legacy as any);

    expect(config.topology).toBe('1-datacenter');
    expect(config.datacenters).toBe(legacy.datacenters);
    expect(config.kubernetes_version).toBe('1.29.0');
  });
});

describe('infrastructure mode', () => {
  it('treats an unset mode as the customer choosing', () => {
    expect(getInfrastructureMode()).toBe('customer_choice');
    expect(getInfrastructureMode({})).toBe('customer_choice');
    expect(isProviderFixed({})).toBe(false);
    expect(isProviderFixed({ infrastructure_mode: 'customer_choice' })).toBe(
      false,
    );
  });

  it('reads provider_fixed', () => {
    expect(
      getInfrastructureMode({ infrastructure_mode: 'provider_fixed' }),
    ).toBe('provider_fixed');
    expect(isProviderFixed({ infrastructure_mode: 'provider_fixed' })).toBe(
      true,
    );
  });

  it.each([
    [undefined, ['1-datacenter', '3-datacenter']],
    ['customer_choice', ['1-datacenter', '3-datacenter']],
    ['1-datacenter', ['1-datacenter']],
    ['3-datacenter', ['3-datacenter']],
  ] as const)('topology_mode %s allows %j', (mode, expected) => {
    expect(getAllowedTopologies({ topology_mode: mode })).toEqual(expected);
  });
});

describe('validateFixedSites', () => {
  const policy = { infrastructure_mode: 'provider_fixed' } as const;

  it('needs a list for every allowed topology', () => {
    expect(validateFixedSites(undefined, policy)).toEqual([
      'Pick the site of the single-site layout.',
      'Pick all three sites of the three-site layout.',
    ]);
    expect(validateFixedSites({ '1-datacenter': ['a'] }, policy)).toEqual([
      'Pick all three sites of the three-site layout.',
    ]);
  });

  it('checks only the topology the option allows', () => {
    expect(
      validateFixedSites(
        { '3-datacenter': ['a', 'b', 'c'] },
        { ...policy, topology_mode: '3-datacenter' },
      ),
    ).toEqual([]);
  });

  it('counts only picked sites', () => {
    expect(
      validateFixedSites(
        { '3-datacenter': ['a', null, 'c'] },
        { ...policy, topology_mode: '3-datacenter' },
      ),
    ).toEqual(['Pick all three sites of the three-site layout.']);
  });

  it('refuses the same site twice', () => {
    expect(
      validateFixedSites(
        { '1-datacenter': ['a'], '3-datacenter': ['a', 'b', 'a'] },
        policy,
      ),
    ).toEqual(['The three sites of the three-site layout must differ.']);
  });
});

describe('cleanFixedSitesPolicy', () => {
  it('drops the sites unless the provider fixes them', () => {
    expect(
      cleanFixedSitesPolicy({
        topology_mode: '1-datacenter',
        fixed_openstack_offerings: { '1-datacenter': ['a'] },
      }),
    ).toEqual({ topology_mode: '1-datacenter' });
  });

  it('keeps only the allowed topologies', () => {
    expect(
      cleanFixedSitesPolicy({
        infrastructure_mode: 'provider_fixed',
        topology_mode: '1-datacenter',
        fixed_openstack_offerings: {
          '1-datacenter': ['a'],
          '3-datacenter': ['a', 'b', 'c'],
        },
      }),
    ).toEqual({
      infrastructure_mode: 'provider_fixed',
      topology_mode: '1-datacenter',
      fixed_openstack_offerings: { '1-datacenter': ['a'] },
    });
  });
});

const SITES = [
  { uuid: 'site-a', name: 'Tallinn' },
  { uuid: 'site-b', name: 'Tartu' },
  { uuid: 'site-c', name: 'Narva' },
];

const flavor = (name: string, cores: number, ramGb: number) => ({
  name,
  cores,
  ram: ramGb * 1024,
  disk: 20480,
  sites: SITES.map((site) => ({
    offering_uuid: site.uuid,
    flavor_uuid: `${site.uuid}-${name}`,
  })),
});

const FLAVORS = [
  flavor('small', 1, 2),
  flavor('medium', 2, 4),
  flavor('large', 8, 32),
];

describe('filterCommonFlavors', () => {
  const minimums = { minimal_worker_vcpus: 2, minimal_worker_ram_gb: 4 };

  it('keeps worker flavors meeting the minimums', () => {
    expect(
      filterCommonFlavors(FLAVORS, 'worker', minimums).map((f) => f.name),
    ).toEqual(['medium', 'large']);
  });

  it('does not filter storage flavors', () => {
    expect(filterCommonFlavors(FLAVORS, 'storage', minimums)).toEqual(FLAVORS);
  });

  it('keeps every flavor when no minimum is set', () => {
    expect(filterCommonFlavors(FLAVORS, 'worker', {})).toEqual(FLAVORS);
  });
});

describe('getSiteFlavor', () => {
  it("gives the site's own flavor uuid", () => {
    expect(getSiteFlavor(FLAVORS, 'medium', 2)).toEqual({
      uuid: 'site-c-medium',
      name: 'medium',
      vcpus: 2,
      ram: 4096,
      disk: 20480,
    });
  });

  it('gives nothing for a flavor the sites do not share', () => {
    expect(getSiteFlavor(FLAVORS, 'huge', 0)).toBeUndefined();
    expect(getSiteFlavor(FLAVORS, undefined, 0)).toBeUndefined();
  });
});

describe('mirrorFixedSiteDatacenters', () => {
  const groups = [
    {
      id: 'dc1-worker-1',
      type: 'worker' as const,
      node_count: 3,
      openstack_flavor: {
        uuid: 'site-a-medium',
        name: 'medium',
        vcpus: 2,
        ram: 4096,
        disk: 20480,
      },
      disk_config: { system_disk_size_gb: 20, data_disk_size_gb: 100 },
    },
    {
      id: 'datacenter-1-group-2',
      type: 'storage' as const,
      node_count: 1,
      disk_config: {
        system_disk_size_gb: 20,
        data_disk_size_gb: 100,
        virtual_san_disk_size_gb: 500,
      },
    },
  ];

  it('gives every site the same groups with its own flavors', () => {
    const datacenters = mirrorFixedSiteDatacenters(SITES, FLAVORS, groups);

    expect(datacenters).toHaveLength(3);
    datacenters.forEach((datacenter, index) => {
      expect(datacenter.id).toBe(`datacenter-${index + 1}`);
      expect(datacenter.name).toBe(`Datacenter ${index + 1}`);
      expect(datacenter.openstack_infrastructure).toEqual(SITES[index]);
      expect(datacenter.node_groups.map((group) => group.type)).toEqual([
        'worker',
        'storage',
      ]);
      expect(datacenter.node_groups[0].openstack_flavor).toEqual(
        expect.objectContaining({
          uuid: `${SITES[index].uuid}-medium`,
          name: 'medium',
        }),
      );
      expect(datacenter.node_groups[0].disk_config).toEqual(
        groups[0].disk_config,
      );
      // A group without a flavor gets no flavor key at all.
      expect(datacenter.node_groups[1]).not.toHaveProperty('openstack_flavor');
    });
    expect(datacenters.map((dc) => dc.node_groups.map((g) => g.id))).toEqual([
      ['dc1-worker-1', 'datacenter-1-group-2'],
      ['dc2-worker-1', 'datacenter-2-group-2'],
      ['dc3-worker-1', 'datacenter-3-group-2'],
    ]);
  });

  it('drops a flavor the sites no longer share', () => {
    const [datacenter] = mirrorFixedSiteDatacenters(
      SITES.slice(0, 1),
      FLAVORS.filter((f) => f.name !== 'medium'),
      groups,
    );
    expect(datacenter.node_groups[0]).not.toHaveProperty('openstack_flavor');
  });

  it('is stable for a value it produced', () => {
    const once = mirrorFixedSiteDatacenters(SITES, FLAVORS, groups);
    expect(
      mirrorFixedSiteDatacenters(SITES, FLAVORS, once[0].node_groups),
    ).toEqual(once);
  });

  it('keeps the totals of a mirrored cluster', () => {
    const datacenters = mirrorFixedSiteDatacenters(SITES, FLAVORS, groups);
    const totals = calculateTotalClusterResources({
      kubernetes_version: '1.30.0',
      topology: '3-datacenter',
      datacenters,
      load_balancer: false,
    });
    expect(totals.totalWorkerNodes).toBe(9);
    expect(totals.totalStorageNodes).toBe(3);
  });
});

describe('getFixedSitesState', () => {
  const sites = SITES.slice(0, 1);
  const onSite = (uuid?: string) => [
    {
      id: 'datacenter-1',
      name: 'Datacenter 1',
      ...(uuid ? { openstack_infrastructure: { uuid, name: 'Site' } } : {}),
      node_groups: [],
    },
  ];

  it('is empty for a value without sites', () => {
    expect(getFixedSitesState(onSite(), sites)).toBe('empty');
  });

  it("matches the provider's sites, whatever the UUID's form", () => {
    expect(getFixedSitesState(onSite('site-a'), sites)).toBe('match');
    expect(
      getFixedSitesState(onSite('SITEA'), [{ uuid: 'site-a', name: 'A' }]),
    ).toBe('match');
  });

  it('tells other sites apart', () => {
    expect(getFixedSitesState(onSite('site-b'), sites)).toBe('mismatch');
    expect(getFixedSitesState(onSite('site-a'), SITES)).toBe('mismatch');
  });
});

describe('getNewNodeGroupId', () => {
  it('does not repeat an id a removed group left behind', () => {
    // Group 1 of 2 removed: the next count-based id would be taken.
    expect(
      getNewNodeGroupId({
        id: 'datacenter-1',
        name: 'Datacenter 1',
        node_groups: [
          {
            id: 'datacenter-1-group-2',
            type: 'worker',
            node_count: 1,
            disk_config: { system_disk_size_gb: 20, data_disk_size_gb: 100 },
          },
        ],
      }),
    ).toBe('datacenter-1-group-3');
  });
});

describe('meetsWorkerMinimums', () => {
  const minimums = { minimal_worker_vcpus: 2, minimal_worker_ram_gb: 4 };

  it('checks vCPUs and RAM', () => {
    expect(meetsWorkerMinimums({ vcpus: 2, ram: 4096 }, minimums)).toBe(true);
    expect(meetsWorkerMinimums({ vcpus: 1, ram: 4096 }, minimums)).toBe(false);
    expect(meetsWorkerMinimums({ vcpus: 2, ram: 2048 }, minimums)).toBe(false);
    expect(meetsWorkerMinimums({ vcpus: 1, ram: 1 }, {})).toBe(true);
  });
});

describe('hasSiteChoices', () => {
  it('is false for the defaults', () => {
    expect(hasSiteChoices(createDefaultClusterConfig('3-datacenter'))).toBe(
      false,
    );
  });

  it('is true for changed node groups', () => {
    const config = createDefaultClusterConfig('1-datacenter');
    config.datacenters[0].node_groups[0].node_count = 5;
    expect(hasSiteChoices(config)).toBe(true);
  });

  it("counts a picked infrastructure, but not the provider's sites", () => {
    const config = createDefaultClusterConfig('1-datacenter');
    config.datacenters[0].openstack_infrastructure = {
      uuid: 'site-a',
      name: 'Tallinn',
    };
    expect(hasSiteChoices(config)).toBe(true);
    expect(
      hasSiteChoices(config, { infrastructure_mode: 'provider_fixed' }),
    ).toBe(false);
  });
});

describe('validateMultiDatacenterConfiguration on fixed sites', () => {
  const fixed = {
    infrastructure_mode: 'provider_fixed' as const,
    minimal_worker_vcpus: 2,
    minimal_worker_ram_gb: 4,
  };
  const groups = [
    {
      id: 'dc1-worker-1',
      type: 'worker' as const,
      node_count: 3,
      disk_config: { system_disk_size_gb: 20, data_disk_size_gb: 100 },
    },
  ];
  const config = (nodeGroups) => ({
    kubernetes_version: '1.30.0',
    topology: '3-datacenter' as const,
    datacenters: mirrorFixedSiteDatacenters(SITES, FLAVORS, nodeGroups),
  });

  it('reports a node group error once, for the first site', () => {
    expect(validateMultiDatacenterConfiguration(config(groups), fixed)).toEqual(
      ['Datacenter 1 worker group 1: OpenStack flavor must be selected'],
    );
  });

  it('refuses a worker flavor below the minimums', () => {
    const small = getSiteFlavor(FLAVORS, 'small', 0);
    expect(
      validateMultiDatacenterConfiguration(
        config([{ ...groups[0], openstack_flavor: small }]),
        fixed,
      ),
    ).toEqual([
      'Datacenter 1 worker group 1: Flavor small is below the minimum for worker nodes',
    ]);
  });

  it('reports missing sites once', () => {
    const { datacenters, ...rest } = config([
      { ...groups[0], openstack_flavor: getSiteFlavor(FLAVORS, 'large', 0) },
    ]);
    expect(
      validateMultiDatacenterConfiguration(
        {
          ...rest,
          datacenters: datacenters.map((datacenter) => ({
            ...datacenter,
            openstack_infrastructure: undefined,
          })),
        },
        fixed,
      ),
    ).toEqual(["The provider's sites of the cluster are not set"]);
  });
});
