import { describe, expect, it } from 'vitest';

import { validateIP } from './utils';

describe('validateIP', () => {
  it.each(['192.168.1.1', '10.0.0.1', '255.255.255.255'])(
    'should return true for valid IPv4 address %s',
    (ip) => {
      expect(validateIP(ip)).toBe(true);
    },
  );

  it.each(['::1', '2001:db8::1', 'fe80::1'])(
    'should return true for valid IPv6 address %s',
    (ip) => {
      expect(validateIP(ip)).toBe(true);
    },
  );

  it.each(['not-an-ip', '999.999.999.999'])(
    'should return false for invalid IP address %s',
    (ip) => {
      expect(validateIP(ip)).toBe(false);
    },
  );

  it('should return false for empty string', () => {
    expect(validateIP('')).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(validateIP(undefined)).toBe(false);
  });
});
