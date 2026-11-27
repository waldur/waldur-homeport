import { describe, expect, it } from 'vitest';

import { formatOptionValue, OptionValue } from './OptionValue';

const MULTI = { type: 'select_string_multi', label: 'Models' } as any;

describe('OptionValue', () => {
  it('reads a multiple choice of every model, none or some', () => {
    expect(OptionValue({ option: MULTI, value: ['*'] })).toBe('All models');
    expect(OptionValue({ option: MULTI, value: [] })).toBe('None');
    expect(OptionValue({ option: MULTI, value: ['a', 'b'] })).toBe('a, b');
  });
});

describe('formatOptionValue', () => {
  it('spells a value as plain text', () => {
    expect(
      formatOptionValue({ type: 'select_string' } as any, 'parallel'),
    ).toBe('parallel');
    expect(formatOptionValue({ type: 'boolean' } as any, true)).toBe('Yes');
    expect(formatOptionValue(MULTI, ['a', 'b'])).toBe('a, b');
    expect(formatOptionValue({ type: 'integer' } as any, 0)).toBe('0');
  });

  // A PDF cannot render markup.
  it('strips the markup of an HTML text', () => {
    expect(
      formatOptionValue({ type: 'html_text' } as any, '<p>Use <b>GPUs</b></p>'),
    ).toBe('Use GPUs');
  });

  // Block ends become spaces, or the lines would run together.
  it('keeps the lines of an HTML text apart', () => {
    expect(
      formatOptionValue(
        { type: 'html_text' } as any,
        '<p>Line one</p><p>Line two</p><ul><li>a</li><li>b</li></ul>x<br>y',
      ),
    ).toBe('Line one Line two a b x y');
  });

  it('decodes the entities of an HTML text', () => {
    expect(
      formatOptionValue({ type: 'html_text' } as any, '<p>R&amp;D</p>'),
    ).toBe('R&D');
  });

  // Stored values do not always have the shape their option says.
  it('reads a multiple choice stored as one value', () => {
    expect(formatOptionValue(MULTI, 'a')).toBe('a');
  });

  it('leaves an empty multiple choice out', () => {
    expect(formatOptionValue(MULTI, [])).toBeNull();
  });

  it('has nothing to show for an empty value', () => {
    expect(formatOptionValue({ type: 'string' } as any, '')).toBeNull();
    expect(formatOptionValue({ type: 'string' } as any, '  ')).toBeNull();
    expect(
      formatOptionValue({ type: 'html_text' } as any, '<p></p>'),
    ).toBeNull();
    expect(formatOptionValue({ type: 'string' } as any, undefined)).toBeNull();
  });
});

describe('Kubernetes option values', () => {
  const egress = [
    { name: 'Storage', destination_type: 'cidr', destination: '10.20.0.0/16' },
  ];

  it('summarises a cluster configuration instead of dumping JSON', () => {
    expect(
      formatOptionValue({ type: 'k8s_cluster_config' } as any, {
        kubernetes_version: '1.30.0',
        topology: '1-datacenter',
        datacenters: [{}],
        public_access_rules: [{}, {}],
        egress_rules: egress,
      }),
    ).toBe(
      'Kubernetes 1.30.0 · Single site · Datacenters: 1 · Inbound rules: 2 · Egress: Storage: 10.20.0.0/16 (any traffic)',
    );
  });

  it('lists the egress rules of a resource', () => {
    expect(
      OptionValue({
        option: { type: 'k8s_egress_rules', label: 'Egress' } as any,
        value: egress,
      }),
    ).toBe('Storage: 10.20.0.0/16 (any traffic)');
  });
});

describe('Network option values', () => {
  it('shows a network, or a list of them', () => {
    expect(
      OptionValue({ option: { type: 'cidr' } as any, value: '10.20.0.0/16' }),
    ).toBe('10.20.0.0/16');
    expect(
      formatOptionValue({ type: 'cidr' } as any, ['10.20.0.0/16', 'fd00::/64']),
    ).toBe('10.20.0.0/16, fd00::/64');
  });

  it('summarises an IPsec tunnel instead of dumping JSON', () => {
    expect(
      OptionValue({
        option: { type: 'ipsec_vpn_config', label: 'VPN' } as any,
        value: {
          peer_gateway_ip: '198.51.100.10',
          remote_subnets: ['192.168.10.0/24'],
          ike_version: 'ikev2',
          phase1: {
            encryption: 'aes256',
            integrity: 'sha256',
            dh_group: 19,
            lifetime: 28800,
          },
          phase2: {
            encryption: 'aes256gcm16',
            integrity: 'sha384',
            pfs_group: null,
            lifetime: 3600,
          },
          dpd: null,
          provider: {
            gateway_ip: '203.0.113.10',
            local_subnets: ['10.0.0.0/16'],
          },
        },
      }),
    ).toBe(
      'Peer 198.51.100.10 · IKEv2 · Phase 1: AES-256, SHA-256, ECP 256 (group 19) · Phase 2: AES-256-GCM, SHA-384, no PFS · 192.168.10.0/24 ↔ 10.0.0.0/16',
    );
  });
});

describe('Secret option values', () => {
  const SECRET = { type: 'secret', label: 'Key' } as any;

  it('says whether a secret is set, from the resource status', () => {
    expect(
      OptionValue({
        option: SECRET,
        value: undefined,
        secretStatus: { is_set: true, source: 'customer', modified: null },
      }),
    ).toBe('Set');
    expect(
      OptionValue({
        option: SECRET,
        value: undefined,
        secretStatus: { is_set: false, source: null, modified: null },
      }),
    ).toBe('Not set');
  });

  it('never shows a typed secret', () => {
    expect(OptionValue({ option: SECRET, value: 'hunter2-key' })).toBe('Set');
    expect(formatOptionValue(SECRET, 'hunter2-key')).toBe('Set');
    expect(formatOptionValue(SECRET, undefined)).toBeNull();
  });
});
