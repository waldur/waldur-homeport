import { FunctionComponent } from 'react';
import { RancherCluster, rancherServicesList } from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import { RancherClusterFilter } from '@/table/generated/RancherClusterFilter';
import Table from '@/table/Table';
import { TableWithPortal } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

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
          render: ({ row }) => <>{renderFieldOrDash(row.cluster_ip)}</>,
        },
        {
          title: translate('Target'),
          render: ({ row }) => (
            <>
              {renderFieldOrDash(
                row.target_workloads
                  .map((workload) => workload.name)
                  .join(', '),
              )}
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
