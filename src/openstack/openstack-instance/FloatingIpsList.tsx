import { FunctionComponent, useCallback } from 'react';

import { getById } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { UpdateFloatingIpsActionButton } from '@waldur/openstack/openstack-instance/actions/update-floating-ips/UpdateFloatingIpsActionButton';
import { VirtualMachine } from '@waldur/resource/types';
import { Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

export const FloatingIpsList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const fetchData = useCallback(
    () =>
      getById<VirtualMachine>(
        '/openstacktenant-instances/',
        resourceScope.uuid,
      ).then((vm) => ({
        rows: vm.floating_ips,
        resultCount: vm.floating_ips.length,
      })),
    [resourceScope],
  );
  const props = useTable({
    table: 'openstack-floating-ips',
    fetchData,
  });
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('IP address'),
          render: ({ row }) => row.address,
        },
        {
          title: translate('MAC address'),
          render: ({ row }) => row.internal_ip_mac_address,
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
      verboseName={translate('floating IPs')}
      tableActions={<UpdateFloatingIpsActionButton resource={resourceScope} />}
    />
  );
};
