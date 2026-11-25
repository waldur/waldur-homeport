import { describe, expect, it } from 'vitest';

import {
  formatEgressRule,
  formatEgressRules,
  K8sEgressRule,
  validateEgressRule,
  validateEgressRules,
} from './k8sEgressRules';

const network: K8sEgressRule = {
  name: 'Storage',
  destination_type: 'cidr',
  destination: '10.20.0.0/16',
};
const domain: K8sEgressRule = {
  name: 'Registry',
  destination_type: 'domain',
  destination: '*.docker.io',
  protocol: 'TCP',
  port_range_min: 443,
  port_range_max: 443,
};

describe('validateEgressRule', () => {
  it.each([
    ['cidr', '10.0.0.0/8'],
    ['cidr', '2001:db8::/32'],
    ['domain', 'registry.example.com'],
    ['domain', '*.example.com'],
  ])('accepts a %s destination %s', (type, destination) => {
    expect(
      validateEgressRule(
        { name: 'Rule', destination_type: type as any, destination },
        true,
      ),
    ).toBeUndefined();
  });

  it.each([
    ['cidr', '10.0.0.0'],
    ['cidr', '10.0.0.0/33'],
    ['cidr', 'example.com'],
    ['domain', 'localhost'],
    ['domain', 'registry.*.example.com'],
    ['domain', '10.0.0.0/8'],
    ['domain', '1.2.3.4'],
  ])('refuses a %s destination %s', (type, destination) => {
    expect(
      validateEgressRule(
        { name: 'Rule', destination_type: type as any, destination },
        true,
      ),
    ).toBeDefined();
  });

  it('refuses a domain when the offering takes networks only', () => {
    expect(validateEgressRule(domain, false)).toMatch(/network destinations/);
  });

  it('needs a name', () => {
    expect(validateEgressRule({ ...network, name: ' ' }, true)).toMatch(/name/);
  });

  it.each([
    [{ port_range_min: 0 }, /1 to 65535/],
    [{ port_range_min: 100, port_range_max: 80 }, /lower/],
    [{ port_range_max: 80 }, /first port/],
    [{ protocol: 'ICMP', port_range_min: 8 }, /ICMP/],
  ])('refuses ports %o', (change, message) => {
    expect(validateEgressRule({ ...network, ...change } as any, true)).toMatch(
      message,
    );
  });
});

describe('validateEgressRules', () => {
  it('accepts no rules whatever the policy', () => {
    expect(validateEgressRules([], {})).toEqual([]);
    expect(validateEgressRules(undefined, undefined)).toEqual([]);
  });

  it('refuses rules when the offering does not take them', () => {
    expect(validateEgressRules([network], {})).toHaveLength(1);
  });

  it('names the rule each problem belongs to', () => {
    expect(
      validateEgressRules([network, domain], { egress_rules_enabled: true }),
    ).toEqual([expect.stringMatching(/^Egress rule Registry:/)]);
  });
});

describe('formatEgressRule', () => {
  it('spells out destination and traffic', () => {
    expect(formatEgressRule(network)).toBe(
      'Storage: 10.20.0.0/16 (any traffic)',
    );
    expect(formatEgressRule(domain)).toBe('Registry: *.docker.io (TCP 443)');
    expect(
      formatEgressRule({
        ...network,
        protocol: 'UDP',
        port_range_min: 8000,
        port_range_max: 8100,
      }),
    ).toBe('Storage: 10.20.0.0/16 (UDP 8000-8100)');
  });

  it('says when outbound traffic is unrestricted', () => {
    expect(formatEgressRules([])).toBe('Unrestricted');
  });
});
