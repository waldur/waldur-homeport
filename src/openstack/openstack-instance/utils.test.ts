import { describe, expect, it } from 'vitest';

import {
  formatAddressList,
  formatSubnet,
  formatSubnetName,
  validateOpenstackInstanceName,
} from './utils';

describe('OpenStack Instance Name Validator', () => {
  it('allows trailing slash', () => {
    expect(validateOpenstackInstanceName('example.com.')).toBe(undefined);
  });

  it('allows single component', () => {
    expect(validateOpenstackInstanceName('example')).toBe(undefined);
  });

  it('does not allow long name', () => {
    const name = 'e'.repeat(64);
    expect(validateOpenstackInstanceName(name)).toBe(
      'Name "{label}" must be 1-63 characters long, each of which can only be alphanumeric or a hyphen'.replace(
        '{label}',
        name,
      ),
    );
  });

  it('does not allow empty component', () => {
    expect(validateOpenstackInstanceName('example..com.')).toEqual(
      'Encountered an empty component',
    );
  });

  it('must not start with a hyphen', () => {
    expect(validateOpenstackInstanceName('example-.com')).toEqual(
      'Name "example-" must not start or end with a hyphen',
    );
  });

  it('must not end with a hyphen', () => {
    expect(validateOpenstackInstanceName('-example.com')).toEqual(
      'Name "-example" must not start or end with a hyphen',
    );
  });

  it('must not contain special symbol', () => {
    expect(validateOpenstackInstanceName('example#"@?.com')).toEqual(
      'Name "example#"@?" must be 1-63 characters long, each of which can only be alphanumeric or a hyphen',
    );
  });

  it('must not be all numeric', () => {
    expect(validateOpenstackInstanceName('aaa.999')).toEqual(
      'TLD "999" must not be all numeric',
    );
  });
});

describe('formatAddressList', () => {
  it('formats address list correctly', () => {
    const row: any = {
      fixed_ips: [{ ip_address: '192.168.1.1' }, { ip_address: '192.168.1.2' }],
    };
    expect(formatAddressList(row)).toBe('192.168.1.1, 192.168.1.2');
  });

  it('handles null fixed_ips correctly', () => {
    const row: any = {
      fixed_ips: null,
    };
    expect(formatAddressList(row)).toBe('—');
  });

  it('handles empty fixed_ips correctly', () => {
    const row: any = {
      fixed_ips: [],
    };
    expect(formatAddressList(row)).toBe('—');
  });
});

describe('formatSubnet', () => {
  it('shows the name and CIDR of a named subnet', () => {
    expect(formatSubnet({ name: 'private', cidr: '10.0.0.0/24' })).toBe(
      'private (10.0.0.0/24)',
    );
  });

  it('shows only the CIDR of a nameless subnet', () => {
    expect(formatSubnet({ name: '', cidr: '10.0.0.0/24' })).toBe('10.0.0.0/24');
  });
});

describe('formatSubnetName', () => {
  it('shows the name of a named subnet', () => {
    expect(formatSubnetName({ name: 'private', cidr: '10.0.0.0/24' })).toBe(
      'private',
    );
  });

  it('shows the CIDR of a nameless subnet', () => {
    expect(formatSubnetName({ name: '', cidr: '10.0.0.0/24' })).toBe(
      '10.0.0.0/24',
    );
  });
});
