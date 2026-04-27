import { describe, it, expect } from 'vitest';
import { OpenStackNestedPort } from 'waldur-js-client';

import { renderTable } from '@/table/testUtils';

import { TenantPortsList } from './TenantPortsList';

const renderList = () => {
  const item: OpenStackNestedPort = {
    fixed_ips: [{ ip_address: '192.168.42.14', subnet_id: '' }],
    mac_address: 'fa:16:3e:93:f0:7d',
    network_name: 'theses-and-papers-on-mach-sub-net',
    network_uuid: '7350f289a6d14e4bbd780ee59b2899e6',
    allowed_address_pairs: [],
    uuid: 'uuid',
    url: 'url',
  };
  return renderTable(TenantPortsList, 'openstack-ports', 'uuid', item);
};

describe('TenantPortsList', () => {
  it('renders list', () => {
    const wrapper = renderList();
    expect(wrapper.find('tbody').html()).toMatchSnapshot();
  });
});
