import { describe, expect, it } from 'vitest';

import { validateIPv4CIDR, validateIPv6CIDR } from './CIDRField';

describe('validateIPv4CIDR', () => {
  it.each(['192.168.1.0/24', '10.0.0.0/8', '0.0.0.0/0'])(
    'should accept valid IPv4 CIDR: %s',
    (cidr) => {
      expect(validateIPv4CIDR(cidr)).toBeUndefined();
    },
  );

  it.each(['999.999.999.999/24', 'not-a-cidr', '192.168.1.0/33'])(
    'should reject invalid IPv4 CIDR: %s',
    (cidr) => {
      expect(validateIPv4CIDR(cidr)).toBeDefined();
    },
  );

  it('should accept empty/undefined values', () => {
    expect(validateIPv4CIDR(undefined)).toBeUndefined();
    expect(validateIPv4CIDR('')).toBeUndefined();
  });
});

describe('validateIPv6CIDR', () => {
  it.each(['::/0', 'fe80::/10', '2001:db8::/32'])(
    'should accept valid IPv6 CIDR: %s',
    (cidr) => {
      expect(validateIPv6CIDR(cidr)).toBeUndefined();
    },
  );

  it.each(['xyz::/0', '2001:db8::/129'])(
    'should reject invalid IPv6 CIDR: %s',
    (cidr) => {
      expect(validateIPv6CIDR(cidr)).toBeDefined();
    },
  );

  it('should accept empty/undefined values', () => {
    expect(validateIPv6CIDR(undefined)).toBeUndefined();
    expect(validateIPv6CIDR('')).toBeUndefined();
  });
});
