import { describe, expect, it } from 'vitest';

import {
  CidrOptionPolicy,
  describeCidrPolicy,
  getCidrPlaceholder,
  formatCidrValue,
  validateCidrPolicy,
  validateCidrValue,
  validateNetwork,
  validateNetworkList,
} from './cidrOptions';

const POLICY: CidrOptionPolicy = {
  ip_version: 'ipv4',
  prefix_length_min: 16,
  prefix_length_max: 28,
  allowed_ranges: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'],
  excluded_ranges: ['10.96.0.0/12'],
};

describe('validateNetwork', () => {
  it('accepts a network the policy allows', () => {
    expect(validateNetwork('10.20.0.0/16', POLICY)).toBeUndefined();
  });

  it.each([
    ['10.20.0.0', 'Enter a network in CIDR notation, such as 10.0.0.0/16.'],
    [
      '10.20.0.5/16',
      '10.20.0.5/16 has host bits set. Did you mean 10.20.0.0/16?',
    ],
    ['fd00::/64', 'Enter an IPv4 network.'],
    [
      '10.0.0.0/8',
      'The network is too large: the prefix length must be at least /16.',
    ],
    [
      '10.20.0.0/29',
      'The network is too small: the prefix length must be at most /28.',
    ],
    [
      '8.8.0.0/16',
      '8.8.0.0/16 is not inside the allowed ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.',
    ],
    [
      '10.100.0.0/16',
      '10.100.0.0/16 overlaps the excluded range 10.96.0.0/12.',
    ],
  ])('refuses %s', (value, message) => {
    expect(validateNetwork(value, POLICY)).toBe(message);
  });

  it('accepts any network without a policy', () => {
    expect(validateNetwork('2001:db8::/32')).toBeUndefined();
    expect(validateNetwork('0.0.0.0/0')).toBeUndefined();
  });
});

describe('validateNetworkList', () => {
  it('names the overlapping entries', () => {
    expect(validateNetworkList(['10.0.0.0/16', '10.0.1.0/24'], {}).list).toBe(
      '10.0.1.0/24 overlaps 10.0.0.0/16.',
    );
  });

  it('reports each bad entry in place', () => {
    expect(validateNetworkList(['10.0.0.0/16', 'nope'], {}).items).toEqual([
      undefined,
      'Enter a network in CIDR notation, such as 10.0.0.0/16.',
    ]);
  });

  it('caps the length at max_items', () => {
    expect(
      validateNetworkList(['10.0.0.0/16', '10.1.0.0/16'], { max_items: 1 })
        .list,
    ).toBe('Enter at most 1 networks.');
  });

  it('refuses an empty list only when asked to', () => {
    expect(validateNetworkList([], {}).list).toBeUndefined();
    expect(validateNetworkList([], {}, { allowEmpty: false }).list).toBe(
      'Enter at least one network.',
    );
  });
});

describe('validateCidrValue', () => {
  it('leaves an empty optional value alone', () => {
    expect(validateCidrValue(undefined, POLICY)).toBeUndefined();
    expect(validateCidrValue([], { multiple: true })).toBeUndefined();
  });

  it('asks for a network in a required list', () => {
    expect(validateCidrValue([], { multiple: true }, true)).toBe(
      'Enter at least one network.',
    );
  });

  it('refuses a list where one network is expected', () => {
    expect(validateCidrValue(['10.20.0.0/16'], POLICY)).toBe(
      'Enter a single network.',
    );
  });

  it('names the entry of a list by its position', () => {
    expect(
      validateCidrValue(['10.20.0.0/16', '10.20.0.5/16'], {
        ...POLICY,
        multiple: true,
      }),
    ).toEqual([
      'Network 2: 10.20.0.5/16 has host bits set. Did you mean 10.20.0.0/16?',
    ]);
  });

  it('takes a single network for a list, as the server does', () => {
    expect(
      validateCidrValue('10.20.0.0/16', { ...POLICY, multiple: true }),
    ).toBeUndefined();
  });
});

describe('describeCidrPolicy', () => {
  it('says what the policy accepts', () => {
    expect(
      describeCidrPolicy({ ...POLICY, multiple: true, max_items: 5 }),
    ).toBe(
      'IPv4, prefix /16 to /28, inside 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, not overlapping 10.96.0.0/12, up to 5 networks',
    );
  });

  it('says nothing for an open policy', () => {
    expect(describeCidrPolicy({})).toBe('');
  });

  it('words a single prefix limit', () => {
    expect(describeCidrPolicy({ prefix_length_min: 24 })).toBe(
      'Prefix /24 or longer',
    );
  });
});

describe('formatCidrValue', () => {
  it('joins a list', () => {
    expect(formatCidrValue(['10.20.0.0/16', 'fd00:1::/64'])).toBe(
      '10.20.0.0/16, fd00:1::/64',
    );
    expect(formatCidrValue('10.20.0.0/16')).toBe('10.20.0.0/16');
  });
});

describe('validateCidrPolicy', () => {
  it('accepts a sound policy', () => {
    expect(validateCidrPolicy({ ...POLICY, max_items: 5 })).toBeUndefined();
  });

  it('keeps prefix limits within the IP version', () => {
    expect(
      validateCidrPolicy({ ip_version: 'ipv4', prefix_length_max: 64 }),
    ).toEqual({ prefix_length_max: 'Enter a prefix length from 0 to 32.' });
  });

  it('refuses limits the wrong way round', () => {
    expect(
      validateCidrPolicy({ prefix_length_min: 28, prefix_length_max: 16 }),
    ).toEqual({
      prefix_length_max:
        'The largest prefix length must not be lower than the smallest.',
    });
  });

  it('checks the ranges and their IP version', () => {
    expect(
      validateCidrPolicy({
        ip_version: 'ipv6',
        allowed_ranges: ['10.0.0.0/8'],
        excluded_ranges: ['fd00::1/64'],
      }),
    ).toEqual({
      allowed_ranges: '10.0.0.0/8 is not an IPv6 network.',
      excluded_ranges: 'fd00::1/64 has host bits set. Did you mean fd00::/64?',
    });
  });

  it('bounds max_items', () => {
    expect(validateCidrPolicy({ max_items: 0 })?.max_items).toBeDefined();
    expect(validateCidrPolicy({ max_items: 300 })).toEqual({
      max_items: 'Enter at most 256.',
    });
  });
});

describe('getCidrPlaceholder', () => {
  it('fits the example to the policy', () => {
    expect(getCidrPlaceholder(POLICY)).toBe('10.0.0.0/16');
    expect(getCidrPlaceholder({ prefix_length_min: 24 })).toBe('10.0.0.0/24');
    expect(getCidrPlaceholder({ ip_version: 'ipv6' })).toBe('fd00:1::/64');
  });

  it('never suggests a network to avoid, such as the provider end', () => {
    expect(getCidrPlaceholder({}, ['10.0.0.0/16'])).toBe('192.168.10.0/24');
    expect(
      getCidrPlaceholder({ allowed_ranges: ['10.0.0.0/16'] }, ['10.0.0.0/8']),
    ).toBe('');
  });
});
