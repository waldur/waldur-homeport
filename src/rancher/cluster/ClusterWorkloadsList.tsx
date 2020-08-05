import * as React from 'react';

import { formatDate } from '@waldur/core/dateUtils';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';

import { WorkloadActions } from './WorkloadActions';

const TableComponent = (props) => {
  const { translate } = props;
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <span>{row.name}</span>,
        },
        {
          title: translate('Project'),
          render: ({ row }) => <span>{row.project_name}</span>,
        },
        {
          title: translate('Namespace'),
          render: ({ row }) => <span>{row.namespace_name}</span>,
        },
        {
          title: translate('Scale'),
          render: ({ row }) => <span>{row.scale}</span>,
        },
        {
          title: translate('Created'),
          render: ({ row }) => <span>{formatDate(row.created)}</span>,
        },
        {
          title: translate('State'),
          render: ({ row }) => <span>{row.runtime_state}</span>,
        },
        {
          title: translate('Actions'),
          render: ({ row }) => <WorkloadActions workload={row} />,
        },
      ]}
      verboseName={translate('workloads')}
    />
  );
};

const TableOptions: TableOptionsType = {
  table: 'rancher-workloads',
  fetchData: createFetcher('rancher-workloads'),
  mapPropsToFilter: (props) => ({
    cluster_uuid: props.resource.uuid,
  }),
};

export const ClusterWorkloadsList = connectTable(TableOptions)(TableComponent);
