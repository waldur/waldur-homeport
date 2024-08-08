import { FunctionComponent, useCallback } from 'react';

import { getById } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { VirtualMachine, InternalIP } from '@waldur/resource/types';
import { Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { UpdateInternalIpsAction } from './actions/update-internal-ips/UpdateInternalIpsSetAction';
import { SetAllowedAddressPairsButton } from './SetAllowedAddressPairsButton';
import { formatAddressList } from './utils';

export const InternalIpsList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const fetchData = useCallback(
    () =>
      getById<VirtualMachine>(
        '/openstacktenant-instances/',
        resourceScope.uuid,
      ).then((vm) => ({
        rows: vm.internal_ips_set,
        resultCount: vm.internal_ips_set.length,
      })),
    [resourceScope],
  );
  const props = useTable({
    table: 'openstack-internal-ips',
    fetchData,
  });
  return (
    <Table<InternalIP>
      {...props}
      columns={[
        {
          title: translate('IP address'),
          render: ({ row }) => <>{formatAddressList(row)}</>,
        },
        {
          title: translate('MAC address'),
          render: ({ row }) => <>{row.mac_address}</>,
        },
        {
          title: translate('Subnet name'),
          render: ({ row }) => <>{row.subnet_name}</>,
        },
        {
          title: translate('Subnet CIDR'),
          render: ({ row }) => <>{row.subnet_cidr}</>,
        },
        {
          title: translate('Actions'),
          render: ({ row }) => (
            <SetAllowedAddressPairsButton
              instance={resourceScope}
              internalIp={row}
            />
          ),
        },
      ]}
      verboseName={translate('internal IPs')}
      tableActions={<UpdateInternalIpsAction resource={resourceScope} />}
    />
  );
};
