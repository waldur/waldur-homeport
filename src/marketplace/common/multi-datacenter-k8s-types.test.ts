import { describe, expect, it } from 'vitest';

import {
  calculateTotalClusterResources,
  changeClusterTopology,
  createDefaultClusterConfig,
  getInitialClusterConfig,
  getInitialTopology,
  getTopologyMode,
  hasLoadBalancer,
  isTopologyAllowed,
  validateMultiDatacenterConfiguration,
} from './multi-datacenter-k8s-types';

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

describe('topology mode', () => {
  it('falls back to the option type when the offering sets no mode', () => {
    expect(getTopologyMode('single_datacenter_k8s_config')).toBe(
      '1-datacenter',
    );
    expect(getTopologyMode('multi_datacenter_k8s_config')).toBe('3-datacenter');
    expect(getTopologyMode('multi_datacenter_k8s_config', {})).toBe(
      '3-datacenter',
    );
  });

  it('lets the offering mode override the option type', () => {
    expect(
      getTopologyMode('single_datacenter_k8s_config', {
        topology_mode: '3-datacenter',
      }),
    ).toBe('3-datacenter');
    expect(
      getTopologyMode('multi_datacenter_k8s_config', {
        topology_mode: 'customer_choice',
      }),
    ).toBe('customer_choice');
  });

  it('ignores a stored topology under a fixed mode', () => {
    expect(
      getInitialTopology(
        'single_datacenter_k8s_config',
        { topology: '3-datacenter' },
        { topology_mode: '1-datacenter' },
      ),
    ).toBe('1-datacenter');
  });

  it('keeps the customer pick, starting from the option type', () => {
    const configs = { topology_mode: 'customer_choice' as const };
    expect(
      getInitialTopology(
        'single_datacenter_k8s_config',
        { topology: '3-datacenter' },
        configs,
      ),
    ).toBe('3-datacenter');
    expect(
      getInitialTopology('single_datacenter_k8s_config', undefined, configs),
    ).toBe('1-datacenter');
    expect(
      getInitialTopology('multi_datacenter_k8s_config', undefined, configs),
    ).toBe('3-datacenter');
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
      isTopologyAllowed(config, 'single_datacenter_k8s_config', {
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
    // [type, mode, topology, datacenter count, allowed]
    ['single_datacenter_k8s_config', undefined, '1-datacenter', 1, true],
    ['single_datacenter_k8s_config', undefined, '3-datacenter', 3, false],
    ['multi_datacenter_k8s_config', undefined, '3-datacenter', 3, true],
    ['multi_datacenter_k8s_config', '1-datacenter', '3-datacenter', 3, false],
    ['single_datacenter_k8s_config', '3-datacenter', '3-datacenter', 3, true],
    [
      'single_datacenter_k8s_config',
      'customer_choice',
      '3-datacenter',
      3,
      true,
    ],
    [
      'single_datacenter_k8s_config',
      'customer_choice',
      '1-datacenter',
      1,
      true,
    ],
    [
      'single_datacenter_k8s_config',
      'customer_choice',
      '1-datacenter',
      3,
      false,
    ],
    ['single_datacenter_k8s_config', '1-datacenter', '1-datacenter', 2, false],
  ] as const)(
    'checks %s with mode %s against a %s config of %i site(s)',
    (type, mode, topology, count, allowed) => {
      const config = {
        topology,
        datacenters: createDefaultClusterConfig(
          '3-datacenter',
        ).datacenters.slice(0, count),
      };
      expect(
        isTopologyAllowed(config, type, mode ? { topology_mode: mode } : {}),
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
