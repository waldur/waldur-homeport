import { FunctionComponent, useCallback } from 'react';
import {
  OpenStackInstance,
  openstackInstancesRetrieve,
  OpenStackNestedFloatingIp,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { UpdateFloatingIpsActionButton } from '@waldur/openstack/openstack-instance/actions/update-floating-ips/UpdateFloatingIpsActionButton';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

export const FloatingIpsList: FunctionComponent<{
  resourceScope: OpenStackInstance;
  refetch;
}> = ({ resourceScope, refetch }) => {
  const fetchData = useCallback(
    () =>
      openstackInstancesRetrieve({ path: { uuid: resourceScope.uuid } }).then(
        (vm) => ({
          rows: vm.data.floating_ips,
          resultCount: vm.data.floating_ips.length,
        }),
      ),
    [resourceScope],
  );
  const props = useTable({
    table: 'openstack-floating-ips',
    fetchData,
  });
  return (
    <Table<OpenStackNestedFloatingIp>
      {...props}
      columns={[
        {
          title: translate('IP address'),
          render: ({ row }) => row.address,
        },
        {
          title: translate('MAC address'),
          render: ({ row }) => row.port_mac_address,
        },
        {
          title: translate('Subnet name'),
          render: ({ row }) => row.subnet_name,
        },
        {
          title: translate('Subnet CIDR'),
          render: ({ row }) => row.subnet_cidr,
        },
      ]}
      title={translate('Floating IPs')}
      verboseName={translate('floating IPs')}
      showPageSizeSelector
      tableActions={
        <UpdateFloatingIpsActionButton
          resource={resourceScope}
          refetch={() => {
            refetch();
            props.fetch();
          }}
        />
      }
    />
  );
};
