import { describe, expect, it } from 'vitest';

import { getIpMatch } from './ipMatch';

const tenant = {
  backend_metadata: {
    ip_addresses: [
      '10.80.0.12',
      '10.80.0.13',
      '195.80.105.12',
      '195.80.105.13',
    ],
    ip_index: [
      {
        address: '195.80.105.12',
        type: 'floating_ip',
        uuid: 'f1',
        name: 'spare',
        mapped_from: '10.80.0.12',
      },
      {
        address: '195.80.105.13',
        type: 'router',
        uuid: 'r1',
        name: 'gw',
        mapped_from: '10.80.0.13',
      },
      {
        address: '195.80.105.14',
        type: 'floating_ip',
        uuid: 'f2',
        name: 'web',
        mapped_from: '10.80.0.14',
        attached_to: { type: 'load_balancer', name: 'web-lb' },
      },
      { address: '192.168.1.60', type: 'port', uuid: 'p1', name: 'vip' },
    ],
  },
};

describe('getIpMatch', () => {
  it('names a router whose gateway maps to the address', () => {
    expect(getIpMatch(tenant, ' 195.80.105.13 ')).toEqual({
      label: 'Router gw: public IP 195.80.105.13, mapped from 10.80.0.13',
      tab: 'routers',
      object: undefined,
    });
  });

  it('says what a floating IP is attached to', () => {
    expect(getIpMatch(tenant, '195.80.105.14')?.label).toBe(
      'Floating IP web on Load balancer web-lb: public IP 195.80.105.14, mapped from 10.80.0.14',
    );
  });

  it('links a port match to that port', () => {
    expect(getIpMatch(tenant, '192.168.1.60')).toEqual({
      label: 'Port vip: 192.168.1.60',
      tab: 'ports',
      object: 'p1',
    });
  });

  it('prefers an exact match over a partial one', () => {
    expect(getIpMatch(tenant, '195.80.105.1')?.tab).toBe('floating_ips');
    expect(getIpMatch(tenant, '195.80.105.13')?.tab).toBe('routers');
  });

  it('describes a VM by its own addresses', () => {
    const vm = {
      backend_metadata: {
        external_address: ['195.80.105.11'],
        external_ips: ['10.80.0.11'],
        internal_ips: ['192.168.1.10'],
      },
    };
    expect(getIpMatch(vm, '195.80.105.11')).toEqual({
      label: 'Mapped public IP 195.80.105.11',
    });
    expect(getIpMatch(vm, '192.168.1.10')?.label).toBe(
      'Internal IP 192.168.1.10',
    );
  });

  it('matches addresses case-insensitively, like the backend', () => {
    const v6 = {
      backend_metadata: {
        ip_index: [
          { address: '2001:db8::5', type: 'router', uuid: 'r2', name: 'gw6' },
        ],
      },
    };
    expect(getIpMatch(v6, '2001:DB8::5')?.label).toBe(
      'Router gw6: 2001:db8::5',
    );
  });

  it('does not focus on one port for a partial match', () => {
    expect(getIpMatch(tenant, '192.168.1.6')).toEqual({
      label: 'Port vip: 192.168.1.60',
      tab: 'ports',
      object: undefined,
    });
  });

  it('explains nothing when the name matched or the query is not an address', () => {
    expect(getIpMatch({ ...tenant, name: 'project-105' }, '105')).toBeNull();
    // Hex in an IPv6 address is not a reason to point at it.
    expect(getIpMatch(tenant, 'cafe')).toBeNull();
  });

  it('leaves out a floating IP name that is its own address', () => {
    const fip = {
      backend_metadata: {
        ip_index: [
          {
            address: '195.80.105.12',
            type: 'floating_ip',
            uuid: 'f3',
            name: '10.80.0.12',
            mapped_from: '10.80.0.12',
          },
        ],
      },
    };
    expect(getIpMatch(fip, '195.80.105.12')?.label).toBe(
      'Floating IP: public IP 195.80.105.12, mapped from 10.80.0.12',
    );
  });

  it('ignores index entries of an unknown type', () => {
    const odd = {
      backend_metadata: {
        ip_index: [{ address: '10.0.0.9', type: 'vpn', uuid: 'v1' }],
      },
    };
    expect(getIpMatch(odd, '10.0.0.9')).toBeNull();
  });

  it('returns nothing when the search matched something else', () => {
    expect(getIpMatch(tenant, 'my-tenant')).toBeNull();
    expect(getIpMatch({ backend_metadata: null }, '10.0.0.1')).toBeNull();
    expect(getIpMatch(tenant, '  ')).toBeNull();
  });
});
