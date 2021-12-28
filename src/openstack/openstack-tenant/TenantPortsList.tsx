import { FunctionComponent } from 'react';

import { ResourceRowActions } from '@waldur/resource/actions/ResourceRowActions';
import { Table, connectTable, createFetcher } from '@waldur/table';

import { Port } from '../types';

import { ExpandablePortRow } from './ExpandablePortRow';

const TableComponent: FunctionComponent<any> = (props) => {
  const { translate } = props;
  return (
    <Table<Port>
      {...props}
      columns={[
        {
          title: translate('IP address'),
          render: ({ row }) =>
            row.fixed_ips.map((fip) => fip.ip_address).join(', ') || 'N/A',
        },
        {
          title: translate('MAC address'),
          render: ({ row }) => row.mac_address || 'N/A',
        },
        {
          title: translate('Network name'),
          render: ({ row }) => row.network_name || 'N/A',
        },
        {
          title: translate('Actions'),
          render: ({ row }) => <ResourceRowActions resource={row} />,
        },
      ]}
      expandableRow={ExpandablePortRow}
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
