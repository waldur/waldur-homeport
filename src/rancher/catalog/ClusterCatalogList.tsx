import { FunctionComponent, useMemo } from 'react';
import { RancherCatalog } from 'waldur-js-client';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { Column, TableWithPortal } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { CatalogCreateButton } from './CatalogCreateButton';
import { CatalogDeleteButton } from './CatalogDeleteButton';

export const ClusterCatalogList: FunctionComponent<
  TableWithPortal<{ resourceScope }>
> = ({ resourceScope, portal }) => {
  const filter = useMemo(
    () => ({
      cluster_uuid: resourceScope.uuid,
    }),
    [resourceScope],
  );
  const props = useTable({
    table: 'rancher-catalogs',
    fetchData: createFetcher('rancher-catalogs'),
    filter,
  });
  const columns = useMemo(
    () =>
      [
        {
          title: translate('Name'),
          render: ({ row }) => (
            <Link
              state="rancher-catalog-details"
              params={{
                clusterUuid: resourceScope.uuid,
                catalogUuid: row.uuid,
                uuid: resourceScope.project_uuid,
              }}
              label={row.name}
            />
          ),

          copyField: (row) => row.name,
          export: 'name',
        },
        {
          title: translate('Description'),
          render: ({ row }) => <>{row.description}</>,
          export: 'description',
        },
        {
          title: translate('URL'),
          render: ({ row }) => <>{row.catalog_url}</>,
          export: 'catalog_url',
        },
      ] satisfies Column<RancherCatalog>[],
    [resourceScope],
  );

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('catalogues')}
      showPageSizeSelector
      tableActions={<CatalogCreateButton cluster={resourceScope} />}
      rowActions={({ row }) =>
        row.scope_type === 'cluster' ? (
          <CatalogDeleteButton catalog={row} refetch={props.fetch} />
        ) : null
      }
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
    />
  );
};
