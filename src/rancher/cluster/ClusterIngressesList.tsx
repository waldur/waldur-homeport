import { FunctionComponent } from 'react';
import { RancherIngress } from 'waldur-js-client';

import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { TableWithPortal } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { ClusterFilter, useClusterResourceFilter } from './ClusterFilter';
import { ImportYAMLButton } from './ImportYAMLButton';
import { IngressActions } from './IngressActions';

export const ClusterIngressesList: FunctionComponent<
  TableWithPortal<{ resourceScope }>
> = ({ resourceScope, portal }) => {
  const filter = useClusterResourceFilter(resourceScope);

  const props = useTable({
    table: 'rancher-ingresses',
    fetchData: createFetcher('rancher-ingresses'),
    filter,
  });

  return (
    <Table<RancherIngress>
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          copyField: (row) => row.name,
        },
        {
          title: translate('Project'),
          render: ({ row }) => <>{row.rancher_project_name}</>,
          filter: 'rancher_project',
        },
        {
          title: translate('Namespace'),
          render: ({ row }) => <>{row.namespace_name}</>,
          filter: 'namespace',
        },
        {
          title: translate('Targets'),
          render: ({ row }) => (
            <>
              {
                // @ts-ignore
                row.rules.map((rule) => rule.host).join(', ')
              }
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
      rowActions={IngressActions}
      verboseName={translate('ingresses')}
      filters={<ClusterFilter cluster={resourceScope} />}
      showPageSizeSelector
      tableActions={<ImportYAMLButton cluster_id={resourceScope.uuid} />}
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
    />
  );
};
