import { FunctionComponent } from 'react';
import { RancherWorkload } from 'waldur-js-client';

import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { TableWithPortal } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { ClusterFilter, useClusterFilter } from './ClusterFilter';
import { WorkloadActions } from './WorkloadActions';

export const ClusterWorkloadsList: FunctionComponent<
  TableWithPortal<{ resourceScope }>
> = ({ resourceScope, portal }) => {
  const filter = useClusterFilter(resourceScope);
  const props = useTable({
    table: 'rancher-workloads',
    fetchData: createFetcher('rancher-workloads'),
    filter,
  });

  return (
    <Table<RancherWorkload>
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
      ]}
      filters={<ClusterFilter cluster={resourceScope} />}
      verboseName={translate('workloads')}
      showPageSizeSelector
      rowActions={({ row }) => <WorkloadActions workload={row} />}
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
    />
  );
};
