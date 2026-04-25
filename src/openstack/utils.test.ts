import { describe, expect, it } from 'vitest';

import { validateIPv4 } from './utils';

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
