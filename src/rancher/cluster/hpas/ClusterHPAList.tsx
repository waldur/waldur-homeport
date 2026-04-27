import { FunctionComponent } from 'react';
import {
  RancherCluster,
  RancherHpa,
  rancherHpasList,
  rancherHpasYamlRetrieve,
  rancherHpasYamlUpdate,
} from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import { RancherClusterFilter } from '@/table/generated/RancherClusterFilter';
import Table from '@/table/Table';
import { TableWithPortal } from '@/table/types';
import { useTable } from '@/table/useTable';

import { useClusterFilter } from '../ClusterFilterHooks';
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
    fetchData: createFetcher(rancherHpasList),
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
      filters={<RancherClusterFilter cluster={resourceScope} />}
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
    />
  );
};
