import * as React from 'react';

import { formatDate } from '@waldur/core/dateUtils';
import { HPA } from '@waldur/rancher/types';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { TableOptionsType } from '@waldur/table-react/types';

import { HPACreateButton } from './HPACreateButton';
import { HPADeleteButton } from './HPADeleteButton';

const TableComponent = props => {
  const { translate } = props;
  return (
    <Table<HPA>
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
          title: translate('Workload'),
          render: ({ row }) => <span>{row.workload_name}</span>,
        },
        {
          title: translate('Min replicas'),
          render: ({ row }) => <span>{row.min_replicas}</span>,
        },
        {
          title: translate('Max replicas'),
          render: ({ row }) => <span>{row.max_replicas}</span>,
        },
        {
          title: translate('Current replicas'),
          render: ({ row }) => <span>{row.current_replicas}</span>,
        },
        {
          title: translate('Desired replicas'),
          render: ({ row }) => <span>{row.desired_replicas}</span>,
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
          render: ({ row }) => <HPADeleteButton hpa={row} />,
        },
      ]}
      verboseName={translate('horizontal pod autoscalers')}
      actions={<HPACreateButton cluster={props.resource} />}
    />
  );
};

const TableOptions: TableOptionsType = {
  table: 'rancher-hpas',
  fetchData: createFetcher('rancher-hpas'),
  mapPropsToFilter: props => ({
    cluster_uuid: props.resource.uuid,
  }),
};

export const ClusterHPAList = connectTable(TableOptions)(TableComponent);
