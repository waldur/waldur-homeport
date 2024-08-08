import { FunctionComponent, useMemo } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { CatalogCreateButton } from './CatalogCreateButton';
import { CatalogDeleteButton } from './CatalogDeleteButton';

export const ClusterCatalogList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
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
    () => [
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
    ],
    [resourceScope],
  );
  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('catalogues')}
      tableActions={<CatalogCreateButton cluster={resourceScope} />}
      rowActions={({ row }) =>
        row.scope_type === 'cluster' ? (
          <CatalogDeleteButton catalog={row} />
        ) : null
      }
    />
  );
};
