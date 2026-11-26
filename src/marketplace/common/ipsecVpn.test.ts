import { describe, expect, it } from 'vitest';

import {
  formatIpsecValue,
  getDefaultIpsecValue,
  IpsecPolicy,
  IpsecVpnConfig,
  isIkeIdentity,
  resolvePhasePolicy,
  validateIpsecPolicy,
  validateIpsecValue,
} from './ipsecVpn';

const POLICY: IpsecPolicy = {
  ikev1_allowed: false,
  provider_gateway_ip: '203.0.113.10',
  provider_local_subnets: ['10.0.0.0/16'],
  remote_subnets: { ip_version: 'ipv4' },
  no_overlap_with: ['cluster_network'],
  phase1: {
    encryption: ['aes256', 'aes128'],
    integrity: ['sha256'],
    dh_groups: [14, 19],
    lifetime_min: 3600,
    lifetime_max: 86400,
    defaults: { encryption: 'aes256', integrity: 'sha256', dh_group: 14 },
  },
  phase2: { pfs_groups: [14, null] },
};

const VALUE: IpsecVpnConfig = {
  ...getDefaultIpsecValue(POLICY),
  peer_gateway_ip: '198.51.100.10',
  remote_subnets: ['192.168.10.0/24'],
};

describe('resolvePhasePolicy', () => {
  it('fills an empty policy as the server does', () => {
    const phase1 = resolvePhasePolicy({}, 'phase1');
    expect(phase1.integrity).toEqual(['sha256', 'sha384', 'sha512']);
    expect(phase1.groups).toEqual([14, 15, 16, 19, 20, 21, 31]);
    expect(phase1.defaults).toEqual({
      encryption: 'aes256',
      integrity: 'sha256',
      group: 14,
      lifetime: 28800,
    });
    expect(resolvePhasePolicy({}, 'phase2').defaults.lifetime).toBe(3600);
  });

  it('falls to the first allowed value when the built-in one is left out', () => {
    expect(
      resolvePhasePolicy({ phase2: { encryption: ['aes128'] } }, 'phase2')
        .defaults.encryption,
    ).toBe('aes128');
  });

  it('keeps a default lifetime within the limits', () => {
    expect(
      resolvePhasePolicy({ phase1: { lifetime_max: 7200 } }, 'phase1').defaults
        .lifetime,
    ).toBe(7200);
  });
});

describe('getDefaultIpsecValue', () => {
  it('starts on IKEv2 and the policy defaults', () => {
    expect(getDefaultIpsecValue(POLICY)).toEqual({
      peer_gateway_ip: '',
      peer_id: '',
      remote_subnets: [],
      ike_version: 'ikev2',
      phase1: {
        encryption: 'aes256',
        integrity: 'sha256',
        dh_group: 14,
        lifetime: 28800,
      },
      phase2: {
        encryption: 'aes256',
        integrity: 'sha256',
        pfs_group: 14,
        lifetime: 3600,
      },
      dpd: null,
    });
  });
});

describe('validateIpsecValue', () => {
  it('accepts a complete value', () => {
    expect(validateIpsecValue(VALUE, POLICY)).toBeUndefined();
  });

  it('asks for the peer and the subnets of an empty value', () => {
    expect(validateIpsecValue(undefined, POLICY)).toEqual({
      peer_gateway_ip:
        'Enter the IP address of your VPN gateway, such as 198.51.100.10.',
      remote_subnets: ['Enter at least one network.'],
    });
  });

  it('refuses a private peer unless the policy allows it', () => {
    const value = { ...VALUE, peer_gateway_ip: '100.64.1.1' };
    expect(validateIpsecValue(value, POLICY)?.peer_gateway_ip).toBe(
      '100.64.1.1 is not a public address. Enter the public IP address of your VPN gateway.',
    );
    expect(
      validateIpsecValue(value, { ...POLICY, allow_private_peer: true }),
    ).toBeUndefined();
  });

  it('refuses IKEv1 unless allowed', () => {
    const value: IpsecVpnConfig = { ...VALUE, ike_version: 'ikev1' };
    expect(validateIpsecValue(value, POLICY)?.ike_version).toBe(
      'This offering accepts IKEv2 only.',
    );
    expect(
      validateIpsecValue(value, { ...POLICY, ikev1_allowed: true }),
    ).toBeUndefined();
  });

  it('refuses algorithms, groups and lifetimes the policy does not allow', () => {
    expect(
      validateIpsecValue(
        {
          ...VALUE,
          phase1: {
            encryption: 'chacha20poly1305',
            integrity: 'sha256',
            dh_group: 31,
            lifetime: 60,
          },
          phase2: { ...VALUE.phase2, pfs_group: null },
        },
        POLICY,
      ),
    ).toEqual({
      phase1: {
        encryption:
          'chacha20poly1305 is not allowed. Choose one of: aes256, aes128.',
        dh_group: '31 is not allowed. Choose one of: 14, 19.',
        lifetime: 'Enter a lifetime from 3600 to 86400 seconds.',
      },
    });
  });

  it('refuses no PFS unless the provider lists it', () => {
    const value = { ...VALUE, phase2: { ...VALUE.phase2, pfs_group: null } };
    expect(
      validateIpsecValue(value, { ...POLICY, phase2: {} })?.phase2?.pfs_group,
    ).toBe('none is not allowed. Choose one of: 14, 15, 16, 19, 20, 21, 31.');
  });

  it('checks the remote subnets against their policy', () => {
    expect(
      validateIpsecValue({ ...VALUE, remote_subnets: ['fd00::/64'] }, POLICY)
        ?.remote_subnets,
    ).toEqual(['Remote subnet 1: Enter an IPv4 network.']);
  });

  it('refuses subnets overlapping the provider end, as on the server', () => {
    // The policy's end on the order form.
    expect(
      validateIpsecValue({ ...VALUE, remote_subnets: ['10.0.5.0/24'] }, POLICY)
        ?.remote_subnets,
    ).toEqual(["10.0.5.0/24 overlaps the provider's subnet 10.0.0.0/16."]);
    // The resource's own end in its dialog.
    expect(
      validateIpsecValue(
        {
          ...VALUE,
          remote_subnets: ['172.20.1.0/24'],
          provider: { gateway_ip: null, local_subnets: ['172.20.0.0/16'] },
        },
        POLICY,
      )?.remote_subnets,
    ).toEqual(["172.20.1.0/24 overlaps the provider's subnet 172.20.0.0/16."]);
  });

  it('refuses subnets overlapping a no_overlap_with option', () => {
    expect(
      validateIpsecValue(
        { ...VALUE, remote_subnets: ['10.20.1.0/24'] },
        POLICY,
        {
          overlapValues: { cluster_network: '10.20.0.0/16' },
          optionLabels: { cluster_network: 'Cluster network' },
        },
      )?.remote_subnets,
    ).toEqual(['10.20.1.0/24 overlaps 10.20.0.0/16 of Cluster network.']);
  });

  it('checks dead peer detection', () => {
    expect(
      validateIpsecValue(
        { ...VALUE, dpd: { action: 'restart', interval: 60, timeout: 30 } },
        POLICY,
      )?.dpd,
    ).toEqual({
      timeout: 'The timeout must not be shorter than the interval.',
    });
  });

  it('checks the peer identity', () => {
    expect(
      validateIpsecValue({ ...VALUE, peer_id: 'not an id' }, POLICY)?.peer_id,
    ).toBeDefined();
  });
});

describe('isIkeIdentity', () => {
  it.each([
    '198.51.100.10',
    '2001:db8::1',
    'vpn.example.com',
    'vpn@example.com',
  ])('accepts %s', (value) => {
    expect(isIkeIdentity(value)).toBe(true);
  });

  it.each(['*.example.com', 'not an id', 'example', 'a@b@example.com'])(
    'refuses %s',
    (value) => {
      expect(isIkeIdentity(value)).toBe(false);
    },
  );
});

describe('formatIpsecValue', () => {
  const stored = {
    ...VALUE,
    provider: { gateway_ip: '203.0.113.10', local_subnets: ['10.0.0.0/16'] },
  };

  it('summarises the tunnel on one line', () => {
    expect(formatIpsecValue(stored)).toBe(
      'Peer 198.51.100.10 · IKEv2 · Phase 1: AES-256, SHA-256, MODP 2048 (group 14) · Phase 2: AES-256, SHA-256, MODP 2048 (group 14) · 192.168.10.0/24 ↔ 10.0.0.0/16',
    );
  });

  it('says when there is no PFS', () => {
    expect(
      formatIpsecValue({
        ...stored,
        phase2: { ...stored.phase2, pfs_group: null },
      }),
    ).toContain('Phase 2: AES-256, SHA-256, no PFS ·');
  });
});

describe('validateIpsecPolicy', () => {
  it('accepts a sound policy', () => {
    expect(validateIpsecPolicy(POLICY, ['cluster_network'])).toBeUndefined();
  });

  it('checks the provider end', () => {
    expect(
      validateIpsecPolicy({
        provider_gateway_ip: 'gateway',
        provider_local_subnets: ['10.0.0.1/16'],
      }),
    ).toEqual({
      provider_gateway_ip: 'Enter a valid IPv4 or IPv6 address.',
      provider_local_subnets:
        'Network 1: 10.0.0.1/16 has host bits set. Did you mean 10.0.0.0/16?',
    });
  });

  it('refuses a no_overlap_with naming no cidr option', () => {
    expect(
      validateIpsecPolicy({ no_overlap_with: ['nope'] }, ['cluster_network']),
    ).toEqual({ no_overlap_with: 'nope: not a cidr option of this offering.' });
  });

  it('keeps defaults within the allowed values and lifetime limits', () => {
    expect(
      validateIpsecPolicy({
        phase1: {
          encryption: ['aes128'],
          lifetime_min: 7200,
          lifetime_max: 3600,
          defaults: { encryption: 'aes256', lifetime: 100 },
        },
        phase2: { pfs_groups: [14], defaults: { pfs_group: null } },
      }),
    ).toEqual({
      phase1: {
        lifetime_max:
          'The longest lifetime must not be shorter than the shortest.',
        defaults: {
          encryption: 'The default must be one of the allowed values.',
          lifetime: 'The default lifetime must be within the lifetime limits.',
        },
      },
      phase2: {
        defaults: {
          pfs_group: 'The default must be one of the allowed values.',
        },
      },
    });
  });

  it('checks the remote subnet rules', () => {
    expect(
      validateIpsecPolicy({
        remote_subnets: { prefix_length_min: 24, prefix_length_max: 8 },
      })?.remote_subnets,
    ).toEqual({
      prefix_length_max:
        'The largest prefix length must not be lower than the smallest.',
    });
  });
});
