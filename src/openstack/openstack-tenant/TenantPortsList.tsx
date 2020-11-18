import * as React from 'react';

import { Table, connectTable, createFetcher } from '@waldur/table';

const TableComponent = (props) => {
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
          title: translate('Network name'),
          render: ({ row }) => row.network_name,
        },
      ]}
      verboseName={translate('ports')}
    />
  );
};

const TableOptions = {
  table: 'openstack-ports',
  fetchData: createFetcher('openstack-ports'),
  mapPropsToFilter: (props) => ({
    tenant_uuid: props.resource.uuid,
    o: 'network_name',
  }),
};

export const TenantPortsList = connectTable(TableOptions)(TableComponent);
