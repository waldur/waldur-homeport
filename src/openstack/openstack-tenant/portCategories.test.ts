import { describe, expect, it } from 'vitest';

import { getPortCategory } from './portCategories';

describe('getPortCategory', () => {
  it('returns null for empty device owner (VIP and unattached ports)', () => {
    expect(getPortCategory(null)).toBeNull();
    expect(getPortCategory(undefined)).toBeNull();
    expect(getPortCategory('')).toBeNull();
  });

  it('returns null for unknown device owner', () => {
    expect(getPortCategory('something:unexpected')).toBeNull();
  });

  it('maps network:distributed to Metadata with a warning', () => {
    const category = getPortCategory('network:distributed');
    expect(category.label).toBe('Metadata');
    expect(category.variant).toBe('danger');
    expect(category.warning).toContain('169.254.169.254');
    expect(category.warning).toContain('cloud-init');
  });

  it('maps router ports to Router with a warning', () => {
    for (const owner of [
      'network:router_interface',
      'network:router_gateway',
      'network:router_centralized_snat',
      'network:ha_router_replicated_interface',
    ]) {
      const category = getPortCategory(owner);
      expect(category.label).toBe('Router');
      expect(category.warning).toBeTruthy();
    }
  });

  it('maps DHCP port to DHCP with a warning', () => {
    const category = getPortCategory('network:dhcp');
    expect(category.label).toBe('DHCP');
    expect(category.warning).toBeTruthy();
  });

  it('maps floating IP ports to Floating IP with a warning', () => {
    for (const owner of [
      'network:floatingip',
      'network:floatingip_agent_gateway',
    ]) {
      const category = getPortCategory(owner);
      expect(category.label).toBe('Floating IP');
      expect(category.warning).toBeTruthy();
    }
  });

  it('maps load balancer ports to Load balancer with a warning', () => {
    for (const owner of [
      'neutron:LOADBALANCER',
      'network:loadbalancer',
      'octavia:health-mgr',
    ]) {
      const category = getPortCategory(owner);
      expect(category.label).toBe('Load balancer');
      expect(category.warning).toBeTruthy();
    }
  });

  it('maps VPN and firewall ports to VPN / Firewall with a warning', () => {
    for (const owner of [
      'network:vpn',
      'network:vpnaas_router',
      'network:firewall',
    ]) {
      const category = getPortCategory(owner);
      expect(category.label).toBe('VPN / Firewall');
      expect(category.warning).toBeTruthy();
    }
  });

  it('maps baremetal ports to Baremetal without a warning', () => {
    for (const owner of ['baremetal:none', 'ironic:neutron']) {
      const category = getPortCategory(owner);
      expect(category.label).toBe('Baremetal');
      expect(category.warning).toBeUndefined();
    }
  });

  it('maps internal service ports to Internal with a warning', () => {
    for (const owner of [
      'network:metering',
      'network:agent_gateway_port',
      'network:routed',
    ]) {
      const category = getPortCategory(owner);
      expect(category.label).toBe('Internal');
      expect(category.warning).toBeTruthy();
    }
  });

  it('maps instance ports to Instance without a warning', () => {
    const category = getPortCategory('compute:nova');
    expect(category.label).toBe('Instance');
    expect(category.warning).toBeUndefined();
  });
});
