import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OpenStackSubNet } from 'waldur-js-client';

import { DASH_ESCAPE_CODE } from '@/table/constants';
import { renderTable } from '@/table/testUtils';

import { TenantSubnetsList } from './TenantSubnetsList';

const subnet = (overrides: Partial<OpenStackSubNet>) =>
  ({
    uuid: '0e8b2f8f2b9a4f5a9a4b1a2c3d4e5f60',
    url: 'api/openstack-subnets/0e8b2f8f2b9a4f5a9a4b1a2c3d4e5f60/',
    name: 'marvin-subnet',
    cidr: '192.168.99.0/24',
    network_name: 'marvin-test',
    state: 'OK',
    resource_type: 'OpenStack.SubNet',
    allocation_pools: [],
    ...overrides,
  }) as OpenStackSubNet;

const renderList = (row: OpenStackSubNet) =>
  renderTable(TenantSubnetsList, 'openstack-subnets', '0', row);

describe('TenantSubnetsList', () => {
  it('shows the router a subnet is attached to', () => {
    // The reported problem: with several routers in a tenant, nothing told the
    // user where a new subnet had gone.
    renderList(
      subnet({ router_name: 'p2p-uplink-router', is_connected: true } as any),
    );

    expect(screen.getByText('p2p-uplink-router')).toBeInTheDocument();
  });

  it('marks the router of a disconnected subnet rather than asserting it', () => {
    // The field deliberately survives a disconnect -- it is where a reconnect
    // sends the subnet -- so the column must not read as a live attachment.
    renderList(
      subnet({
        name: 'marvin-subnet',
        router_name: 'p2p-uplink-router',
        is_connected: false,
      } as any),
    );

    expect(
      screen.getByText('p2p-uplink-router (disconnected)'),
    ).toBeInTheDocument();
  });

  it('shows a dash when no router holds the subnet', () => {
    renderList(subnet({ name: 'skip-subnet', router_name: null } as any));

    expect(screen.getAllByText(DASH_ESCAPE_CODE).length).toBeGreaterThan(0);
  });
});
