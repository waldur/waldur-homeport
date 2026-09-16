import { describe, expect, it } from 'vitest';

import {
  calculateTotalClusterResources,
  createDefaultClusterConfig,
  getInitialClusterConfig,
  hasLoadBalancer,
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
