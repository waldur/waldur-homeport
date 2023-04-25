import { FunctionComponent } from 'react';

import { getById } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { UpdateFloatingIpsActionButton } from '@waldur/openstack/openstack-instance/actions/update-floating-ips/UpdateFloatingIpsActionButton';
import { VirtualMachine } from '@waldur/resource/types';
import { Table, connectTable } from '@waldur/table';

const TableComponent: FunctionComponent<any> = (props) => {
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
      actions={<UpdateFloatingIpsActionButton resource={props.resource} />}
    />
  );
};

const getFloatingIps = (request) =>
  getById<VirtualMachine>(
    '/openstacktenant-instances/',
    request.filter.uuid,
  ).then((vm) => ({
    rows: vm.floating_ips,
    resultCount: vm.floating_ips.length,
  }));

const TableOptions = {
  table: 'openstack-floating-ips',
  fetchData: getFloatingIps,
  mapPropsToFilter: (props) => ({
    uuid: props.resource?.uuid,
  }),
};

export const FloatingIpsList = connectTable(TableOptions)(TableComponent);
