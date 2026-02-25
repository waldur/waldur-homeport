import { FunctionComponent } from 'react';
import { RancherCluster, rancherServicesList } from 'waldur-js-client';

import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import { RancherClusterFilter } from '@waldur/table/generated/RancherClusterFilter';
import Table from '@waldur/table/Table';
import { TableWithPortal } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { useClusterFilter } from './ClusterFilterHooks';
import { ImportYAMLButton } from './ImportYAMLButton';
import { ServiceActions } from './ServiceActions';

export const ClusterServicesList: FunctionComponent<
  TableWithPortal<{ resourceScope: RancherCluster }>
> = ({ resourceScope, portal }) => {
  const filter = useClusterFilter(resourceScope);
  const props = useTable({
    table: 'rancher-services',
    fetchData: createFetcher(rancherServicesList),
    filter,
  });

  return (
    <Table
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
          title: translate('Cluster IP'),
          render: ({ row }) => <>{row.cluster_ip || 'N/A'}</>,
        },
        {
          title: translate('Target'),
          render: ({ row }) => (
            <>
              {row.target_workloads
                .map((workload) => workload.name)
                .join(', ') || 'N/A'}
            </>
          ),
        },
        {
          title: translate('Selector'),
          render: ({ row }) => (
            <>
              {row.selector
                ? Object.entries(row.selector)
                    .map(([key, value]) => `${key}=${value}`)
                    .join(', ')
                : 'N/A'}
            </>
          ),
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
      rowActions={ServiceActions}
      verboseName={translate('services')}
      showPageSizeSelector
      filters={<RancherClusterFilter cluster={resourceScope} />}
      tableActions={<ImportYAMLButton cluster_id={resourceScope.uuid} />}
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
    />
  );
};
