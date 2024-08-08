import { FunctionComponent, useMemo } from 'react';
import { ButtonGroup } from 'react-bootstrap';

import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { HPA } from '@waldur/rancher/types';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { ViewYAMLButton } from '../ViewYAMLButton';

import { HPACreateButton } from './HPACreateButton';
import { HPADeleteButton } from './HPADeleteButton';
import { HPAUpdateButton } from './HPAUpdateButton';

export const ClusterHPAList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    () => ({
      cluster_uuid: resourceScope.uuid,
    }),
    [resourceScope],
  );

  const props = useTable({
    table: 'rancher-hpas',
    fetchData: createFetcher('rancher-hpas'),
    filter,
  });

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
      tableActions={<HPACreateButton cluster={resourceScope} />}
    />
  );
};
