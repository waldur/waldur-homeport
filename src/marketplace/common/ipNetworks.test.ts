import { describe, expect, it } from 'vitest';

import {
  formatNetwork,
  IpNetwork,
  isPublicAddress,
  isSubnetOf,
  networksOverlap,
  parseIpAddress,
  parseNetwork,
} from './ipNetworks';

const network = (text: string) => parseNetwork(text).network as IpNetwork;
const address = (text: string) => parseIpAddress(text);

describe('parseNetwork', () => {
  it.each([
    ['10.0.0.0/16', '10.0.0.0/16'],
    [' 192.168.10.0/24 ', '192.168.10.0/24'],
    ['0.0.0.0/0', '0.0.0.0/0'],
    ['2001:DB8::/32', '2001:db8::/32'],
    ['fd00:0001:0000:0000::/64', 'fd00:1::/64'],
    ['::/0', '::/0'],
    ['::ffff:192.0.2.0/120', '::ffff:c000:200/120'],
  ])('reads %s as %s', (text, expected) => {
    const parsed = parseNetwork(text);
    expect(parsed.hostBits).toBe(false);
    expect(formatNetwork(parsed.network)).toBe(expected);
  });

  it.each([
    '10.0.0.0',
    '10.0.0.0/33',
    '10.0.0.0/255.255.0.0',
    '010.0.0.0/8',
    '10.0.0/8',
    '2001:db8::/129',
    'fe80::1%eth0/64',
    '1:2:3:4:5:6:7:8::/64',
    'not a network',
    '',
  ])('refuses %s', (text) => {
    expect(parseNetwork(text).network).toBeNull();
  });

  it('marks host bits and gives the network the address lies in', () => {
    const parsed = parseNetwork('10.0.0.5/24');
    expect(parsed.hostBits).toBe(true);
    expect(formatNetwork(parsed.network)).toBe('10.0.0.0/24');
  });

  it('compresses the longest run of zeros only', () => {
    expect(formatNetwork(network('2001:0:0:1:0:0:0:0/128'))).toBe(
      '2001:0:0:1::/128',
    );
    expect(formatNetwork(network('2001:db8:0:1:1:1:1:1/128'))).toBe(
      '2001:db8:0:1:1:1:1:1/128',
    );
  });
});

describe('network relations', () => {
  it('tells overlapping networks of one version', () => {
    expect(
      networksOverlap(network('10.0.0.0/8'), network('10.96.0.0/12')),
    ).toBe(true);
    expect(
      networksOverlap(network('10.0.0.0/16'), network('10.1.0.0/16')),
    ).toBe(false);
    expect(networksOverlap(network('0.0.0.0/0'), network('::/0'))).toBe(false);
  });

  it('tells a subnet from a supernet', () => {
    expect(isSubnetOf(network('10.20.0.0/16'), network('10.0.0.0/8'))).toBe(
      true,
    );
    expect(isSubnetOf(network('10.0.0.0/8'), network('10.20.0.0/16'))).toBe(
      false,
    );
  });
});

describe('isPublicAddress', () => {
  it.each([
    '198.51.100.10',
    '203.0.113.1',
    '192.0.2.1',
    '8.8.8.8',
    '2001:db8::1',
    '2a00:1450::1',
  ])('accepts %s', (text) => {
    expect(isPublicAddress(address(text))).toBe(true);
  });

  it.each([
    '10.1.2.3',
    '172.16.0.1',
    '192.168.1.1',
    '100.64.0.1',
    '127.0.0.1',
    '169.254.1.1',
    '224.0.0.1',
    '240.0.0.1',
    '255.255.255.255',
    '0.0.0.0',
    '::1',
    '::',
    'fe80::1',
    'fc00::1',
    'fd12:3456::1',
    'ff02::1',
    '::ffff:10.0.0.1',
  ])('refuses %s', (text) => {
    expect(isPublicAddress(address(text))).toBe(false);
  });

  it('checks an IPv4-mapped address as the IPv4 address', () => {
    expect(isPublicAddress(address('::ffff:198.51.100.10'))).toBe(true);
  });
});
