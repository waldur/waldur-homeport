import { FunctionComponent } from 'react';

import { formatDate } from '@waldur/core/dateUtils';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';

import { WorkloadActions } from './WorkloadActions';

const TableComponent: FunctionComponent<any> = (props) => {
  const { translate } = props;
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
        },
        {
          title: translate('Project'),
          render: ({ row }) => <>{row.project_name}</>,
        },
        {
          title: translate('Namespace'),
          render: ({ row }) => <>{row.namespace_name}</>,
        },
        {
          title: translate('Scale'),
          render: ({ row }) => <>{row.scale}</>,
        },
        {
          title: translate('Created'),
          render: ({ row }) => <>{formatDate(row.created)}</>,
        },
        {
          title: translate('State'),
          render: ({ row }) => <>{row.runtime_state}</>,
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
