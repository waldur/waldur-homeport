import { FunctionComponent } from 'react';
import {
  RancherCluster,
  RancherHpa,
  rancherHpasYamlRetrieve,
  rancherHpasYamlUpdate,
} from 'waldur-js-client';

import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { TableWithPortal } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { ClusterFilter, useClusterFilter } from '../ClusterFilter';
import { ViewYAMLButton } from '../ViewYAMLButton';

import { HPACreateButton } from './HPACreateButton';
import { HPADeleteButton } from './HPADeleteButton';
import { HPAUpdateButton } from './HPAUpdateButton';

const RowActions = ({ row, yamlRetrieve, yamlUpdate }) => (
  <ActionsDropdownComponent>
    <ViewYAMLButton
      yamlRetrieve={yamlRetrieve}
      yamlUpdate={yamlUpdate}
      resource={row}
    />

    <HPAUpdateButton hpa={row} />
    <HPADeleteButton hpa={row} />
  </ActionsDropdownComponent>
);

export const ClusterHPAList: FunctionComponent<
  TableWithPortal<{ resourceScope: RancherCluster }>
> = ({ resourceScope, portal }) => {
  const filter = useClusterFilter(resourceScope);
  const props = useTable({
    table: 'rancher-hpas',
    fetchData: createFetcher('rancher-hpas'),
    filter,
  });

  return (
    <Table<RancherHpa>
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          copyField: (row) => row.name,
        },
        {
          title: translate('Project'),
          render: ({ row }) => <>{row.project_name}</>,
          filter: 'rancher_project',
        },
        {
          title: translate('Namespace'),
          render: ({ row }) => <>{row.namespace_name}</>,
          filter: 'namespace',
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
      ]}
      rowActions={({ row }) => (
        <RowActions
          yamlRetrieve={rancherHpasYamlRetrieve}
          yamlUpdate={rancherHpasYamlUpdate}
          row={row}
        />
      )}
      verboseName={translate('horizontal pod autoscalers')}
      showPageSizeSelector
      tableActions={<HPACreateButton cluster={resourceScope} />}
      filters={<ClusterFilter cluster={resourceScope} />}
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
    />
  );
};
