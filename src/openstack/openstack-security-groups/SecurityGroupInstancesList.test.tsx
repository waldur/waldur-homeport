import { describe, it, expect } from 'vitest';
import { OpenStackInstance, OpenStackSecurityGroup } from 'waldur-js-client';

import { renderTable } from '@/table/testUtils';

import { SecurityGroupInstancesList } from './SecurityGroupInstancesList';

const securityGroup = {
  uuid: 'ff0e04e40b8d4ba09d0a9d5c14b78e59',
} as OpenStackSecurityGroup;

const renderList = () => {
  const instance: Partial<OpenStackInstance> = {
    uuid: '2b1c0eb2b4e64f6b8a4a1a0e5e1a6f11',
    url: 'api/openstack-instances/2b1c0eb2b4e64f6b8a4a1a0e5e1a6f11/',
    name: 'vm1',
    state: 'OK',
    runtime_state: 'ACTIVE',
    resource_type: 'OpenStack.Instance',
    external_ips: ['10.10.10.5'],
    marketplace_resource_uuid: '9a4b8e1c0d2f4a7b8c3d5e6f7a8b9c01',
    ports: [
      {
        url: 'api/openstack-ports/3c9d1e2f4a5b6c7d8e9f0a1b2c3d4e5f/',
        fixed_ips: [{ ip_address: '192.168.42.14', subnet_id: '' }],
        subnet_name: 'theses-and-papers-on-mach-sub-net',
        subnet_cidr: '192.168.42.0/24',
      } as OpenStackInstance['ports'][0],
    ],
  };
  return renderTable(
    () => <SecurityGroupInstancesList row={securityGroup} />,
    `security-group-instances-${securityGroup.uuid}`,
    '0',
    instance,
  );
};

describe('SecurityGroupInstancesList', () => {
  it('renders instance with its internal and external IPs', () => {
    const wrapper = renderList();
    expect(wrapper.container).toMatchSnapshot();
  });
});
