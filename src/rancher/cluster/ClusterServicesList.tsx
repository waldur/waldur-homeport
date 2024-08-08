import { FunctionComponent, useMemo } from 'react';

import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { ImportYAMLButton } from './ImportYAMLButton';
import { ServiceActions } from './ServiceActions';

export const ClusterServicesList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    () => ({
      cluster_uuid: resourceScope.uuid,
    }),
    [resourceScope],
  );
  const props = useTable({
    table: 'rancher-services',
    fetchData: createFetcher('rancher-services'),
    filter,
  });
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
        },
        {
          title: translate('Namespace'),
          render: ({ row }) => <>{row.namespace_name}</>,
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
        {
          title: translate('Actions'),
          render: ({ row }) => <ServiceActions service={row} />,
        },
      ]}
      verboseName={translate('services')}
      tableActions={<ImportYAMLButton cluster_id={resourceScope.uuid} />}
    />
  );
};
