import { describe, expect, it } from 'vitest';

import {
  isIPv6Address,
  parseSubnetCidr,
  validateAllowedAddressPair,
  validateIpInSubnetFamily,
  validateIPv4,
  validateSubnetCidr,
  validateTenantSubnetCidr,
} from './utils';

describe('isIPv6Address', () => {
  it.each([
    '2001:db8::1',
    '::',
    '::1',
    'fe80::',
    '2001:0db8:0000:0000:0000:ff00:0042:8329',
    '1:2:3:4:5:6:7::',
    '::ffff:192.0.2.1',
  ])('accepts %s', (value) => {
    expect(isIPv6Address(value)).toBe(true);
  });

  it.each([
    '',
    '192.168.1.1',
    '2001:db8::1::2',
    '2001:db8:::1',
    '1:2:3:4:5:6:7:8:9',
    '1:2:3:4:5:6:7',
    '2001:db8::g',
    '12345::',
    'fe80::1%eth0',
    '::ffff:999.0.2.1',
  ])('rejects %s', (value) => {
    expect(isIPv6Address(value)).toBe(false);
  });
});

describe('parseSubnetCidr', () => {
  it('reads the family and prefix of either family', () => {
    expect(parseSubnetCidr('192.168.42.0/24')).toEqual({
      version: 4,
      prefix: 24,
    });
    expect(parseSubnetCidr('2001:db8::/64')).toEqual({
      version: 6,
      prefix: 64,
    });
  });

  it.each(['192.168.42.0', '2001:db8::', '10.0.0.0/33', '2001:db8::/129'])(
    'rejects %s',
    (value) => {
      expect(parseSubnetCidr(value)).toBeNull();
    },
  );
});

describe('validateSubnetCidr', () => {
  it('asks for the prefix length when it is missing', () => {
    expect(validateSubnetCidr('2001:db8::')).toMatch(/prefix length/);
  });

  it('accepts CIDRs of both families', () => {
    expect(validateSubnetCidr('10.0.0.0/24')).toBeUndefined();
    expect(validateSubnetCidr('2001:db8::/64')).toBeUndefined();
  });

  it('rejects a malformed address', () => {
    expect(validateSubnetCidr('2001:db8:::/64')).toBeDefined();
  });
});

describe('validateIpInSubnetFamily', () => {
  it('wants an IPv6 address on an IPv6 subnet', () => {
    const values = { cidr: '2001:db8::/64' };
    expect(validateIpInSubnetFamily('2001:db8::1', values)).toBeUndefined();
    expect(validateIpInSubnetFamily('192.168.42.1', values)).toBeDefined();
  });

  it('wants an IPv4 address on an IPv4 subnet', () => {
    const values = { cidr: '192.168.42.0/24' };
    expect(validateIpInSubnetFamily('192.168.42.1', values)).toBeUndefined();
    expect(validateIpInSubnetFamily('2001:db8::1', values)).toBeDefined();
  });
});

describe('validateIPv4', () => {
  it.each(['192.168.1.1', '10.0.0.1'])(
    'should return undefined for valid IPv4 address %s',
    (ip) => {
      expect(validateIPv4(ip)).toBeUndefined();
    },
  );

  it.each(['999.999.999.999', 'abc'])(
    'should return error message for invalid IPv4 address %s',
    (ip) => {
      expect(validateIPv4(ip)).toBeDefined();
    },
  );

  it('should return undefined for empty string', () => {
    expect(validateIPv4('')).toBeUndefined();
  });

  it('should return undefined for undefined', () => {
    expect(validateIPv4(undefined)).toBeUndefined();
  });
});

describe('validateTenantSubnetCidr', () => {
  it('keeps IPv4 bounded to the private ranges', () => {
    expect(validateTenantSubnetCidr('192.168.42.0/24')).toBeUndefined();
    expect(validateTenantSubnetCidr('8.8.8.0/24')).toBeDefined();
  });

  it('accepts an IPv6 /64, which is what SLAAC needs', () => {
    expect(validateTenantSubnetCidr('2001:db8::/64')).toBeUndefined();
    expect(validateTenantSubnetCidr('fd00:42::/64')).toBeUndefined();
  });

  it.each(['2001:db8::/48', '2001:db8::/112'])('refuses %s', (value) => {
    expect(validateTenantSubnetCidr(value)).toMatch(/\/64 prefix/);
  });

  it('asks for the prefix length when it is missing', () => {
    expect(validateTenantSubnetCidr('2001:db8::')).toMatch(/prefix length/);
  });

  it('passes an empty value, which the required validator owns', () => {
    expect(validateTenantSubnetCidr('')).toBeUndefined();
  });
});

describe('validateAllowedAddressPair', () => {
  it('keeps IPv4 bounded to the private ranges', () => {
    expect(validateAllowedAddressPair('10.0.0.10/32')).toBeUndefined();
    expect(validateAllowedAddressPair('8.8.8.8/32')).toBeDefined();
  });

  it.each(['fd00::10', 'fd00::10/128', '2001:db8:1::/64'])(
    'accepts %s, leaving the tenant-scope check to the API',
    (value) => {
      expect(validateAllowedAddressPair(value)).toBeUndefined();
    },
  );

  it.each(['::/0', 'fe80::1', 'ff02::1', '::1', '::', '::ffff:10.0.0.10'])(
    'refuses %s',
    (value) => {
      expect(validateAllowedAddressPair(value)).toBeDefined();
    },
  );

  it('refuses a malformed IPv6 address', () => {
    expect(validateAllowedAddressPair('2001:db8:::1')).toBeDefined();
  });
});
