import { FunctionComponent } from 'react';

import { getById } from '@waldur/core/api';
import { VirtualMachine, InternalIP } from '@waldur/resource/types';
import { Table, connectTable } from '@waldur/table';

import { UpdateInternalIpsAction } from './actions/update-internal-ips/UpdateInternalIpsSetAction';
import { SetAllowedAddressPairsButton } from './SetAllowedAddressPairsButton';

const TableComponent: FunctionComponent<any> = (props) => {
  const { translate } = props;
  return (
    <Table<InternalIP>
      {...props}
      columns={[
        {
          title: translate('IP address'),
          render: ({ row }) =>
            row.fixed_ips.map((fip) => fip.ip_address).join(', ') || 'N/A',
        },
        {
          title: translate('MAC address'),
          render: ({ row }) => row.mac_address,
        },
        {
          title: translate('Subnet name'),
          render: ({ row }) => row.subnet_name,
        },
        {
          title: translate('Subnet CIDR'),
          render: ({ row }) => row.subnet_cidr,
        },
        {
          title: translate('Actions'),
          render: ({ row }) => (
            <SetAllowedAddressPairsButton
              instance={props.resource}
              internalIp={row}
            />
          ),
        },
      ]}
      verboseName={translate('internal IPs')}
      actions={<UpdateInternalIpsAction resource={props.resource} />}
    />
  );
};

const getInternalIps = (request) =>
  getById<VirtualMachine>(
    '/openstacktenant-instances/',
    request.filter.uuid,
  ).then((vm) => ({
    rows: vm.internal_ips_set,
    resultCount: vm.internal_ips_set.length,
  }));

const TableOptions = {
  table: 'openstack-internal-ips',
  fetchData: getInternalIps,
  mapPropsToFilter: (props) => ({
    uuid: props.resource?.uuid,
  }),
};

export const InternalIpsList = connectTable(TableOptions)(TableComponent);
