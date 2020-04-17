import * as React from 'react';

import { getById } from '@waldur/core/api';
import { NestedListActions } from '@waldur/resource/actions/NestedListActions';
import { VirtualMachine } from '@waldur/resource/types';
import { Table, connectTable } from '@waldur/table-react';

const TableComponent = props => {
  const { translate } = props;
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('IPv4 address'),
          render: ({ row }) => row.ip4_address,
        },
        {
          title: translate('MAC address'),
          render: ({ row }) => row.mac_address,
        },
        {
          title: translate('Subnet Name'),
          render: ({ row }) => row.subnet_name,
        },
        {
          title: translate('Subnet CIDR'),
          render: ({ row }) => row.subnet_cidr,
        },
      ]}
      verboseName={translate('internal IPs')}
      actions={
        <NestedListActions resource={props.resource} tab="internal_ips" />
      }
    />
  );
};

const getInternalIps = request =>
  getById<VirtualMachine>(
    '/openstacktenant-instances/',
    request.filter.uuid,
  ).then(vm => ({
    rows: vm.internal_ips_set,
    resultCount: vm.internal_ips_set.length,
  }));

const TableOptions = {
  table: 'openstack-internal-ips',
  fetchData: getInternalIps,
  mapPropsToFilter: props => ({
    uuid: props.resource.uuid,
  }),
};

export const InternalIpsList = connectTable(TableOptions)(TableComponent);
