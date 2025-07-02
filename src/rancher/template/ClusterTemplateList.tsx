import { FunctionComponent, useMemo } from 'react';
import { RancherCluster, RancherTemplate } from 'waldur-js-client';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { TableWithPortal } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

export const ClusterTemplatesList: FunctionComponent<
  TableWithPortal<{ resourceScope: RancherCluster }>
> = ({ resourceScope, portal }) => {
  const filter = useMemo(
    () => ({
      cluster_uuid: resourceScope.uuid,
    }),
    [resourceScope],
  );
  const props = useTable({
    table: 'rancher-cluster-templates',
    fetchData: createFetcher('rancher-templates'),
    filter,
    queryField: 'name',
  });

  return (
    <Table<RancherTemplate>
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => (
            <Link
              state="rancher-template-details"
              params={{
                uuid: resourceScope.project_uuid,
                clusterUuid: resourceScope.uuid,
                templateUuid: row.uuid,
              }}
            >
              {row.name}
            </Link>
          ),

          copyField: (row) => row.name,
          orderField: 'name',
          export: 'name',
        },
        {
          title: translate('Description'),
          render: ({ row }) => <>{row.description}</>,
          export: 'description',
        },
        {
          title: translate('Catalog'),
          render: ({ row }) => <>{row.catalog_name}</>,
          orderField: 'catalog_name',
          export: 'catalog_name',
        },
        {
          title: translate('State'),
          render: ({ row }) => <>{row.runtime_state}</>,
          export: 'runtime_state',
        },
      ]}
      verboseName={translate('application templates')}
      portal={portal}
      hasActionBar={false}
      hasQuery={true}
      showPageSizeSelector
      cardBordered={false}
      fullWidth
    />
  );
};
