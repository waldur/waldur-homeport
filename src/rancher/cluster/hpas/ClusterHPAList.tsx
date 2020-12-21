import { FunctionComponent } from 'react';
import { ButtonGroup } from 'react-bootstrap';

import { formatDate } from '@waldur/core/dateUtils';
import { HPA } from '@waldur/rancher/types';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';

import { ViewYAMLButton } from '../ViewYAMLButton';

import { HPACreateButton } from './HPACreateButton';
import { HPADeleteButton } from './HPADeleteButton';
import { HPAUpdateButton } from './HPAUpdateButton';

const TableComponent: FunctionComponent<any> = (props) => {
  const { translate } = props;
  return (
    <Table<HPA>
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
          title: translate('Workload'),
          render: ({ row }) => <>{row.workload_name}</>,
        },
        {
          title: translate('Min replicas'),
          render: ({ row }) => <>{row.min_replicas}</>,
        },
        {
          title: translate('Max replicas'),
          render: ({ row }) => <>{row.max_replicas}</>,
        },
        {
          title: translate('Current replicas'),
          render: ({ row }) => <>{row.current_replicas}</>,
        },
        {
          title: translate('Desired replicas'),
          render: ({ row }) => <>{row.desired_replicas}</>,
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
          render: ({ row }) => (
            <ButtonGroup>
              <ViewYAMLButton resource={row} />
              <HPAUpdateButton hpa={row} />
              <HPADeleteButton hpa={row} />
            </ButtonGroup>
          ),
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
  mapPropsToFilter: (props) => ({
    cluster_uuid: props.resource.uuid,
  }),
};

export const ClusterHPAList = connectTable(TableOptions)(TableComponent);
