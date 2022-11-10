import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ActionButtonResource } from '@waldur/resource/actions/ActionButtonResource';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { ResourceSummary } from '@waldur/resource/summary/ResourceSummary';
import { Table, connectTable, createFetcher } from '@waldur/table';

import { CreatePortAction } from './actions/CreatePortAction';

const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          orderField: 'name',
        },
        {
          title: translate('Network'),
          render: ({ row }) => row.network_name || 'N/A',
        },
        {
          title: translate('MAC address'),
          render: ({ row }) => row.mac_address || 'N/A',
        },
        {
          title: translate('Created'),
          render: ({ row }) => formatDateTime(row.created),
          orderField: 'created',
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
      ]}
      verboseName={translate('ports')}
      actions={<CreatePortAction resource={props.resource} />}
      expandableRow={({ row }) => <ResourceSummary resource={row} />}
      hoverableRow={({ row }) => <ActionButtonResource url={row.url} />}
    />
  );
};

const mapPropsToFilter = (props) => ({
  vm_uuid: props.resource.uuid,
});

const TableOptions = {
  table: 'vmware-ports',
  fetchData: createFetcher('vmware-ports'),
  mapPropsToFilter,
};

export const PortsList = connectTable(TableOptions)(TableComponent);
