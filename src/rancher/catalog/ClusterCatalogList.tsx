import { FunctionComponent, useMemo } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { CatalogCreateButton } from './CatalogCreateButton';
import { CatalogDeleteButton } from './CatalogDeleteButton';

const exportRow = (row) => [row.name, row.description, row.catalog_url];
export const ClusterCatalogList: FunctionComponent<{ resource }> = ({
  resource,
}) => {
  const filter = useMemo(
    () => ({
      cluster_uuid: resource.uuid,
    }),
    [resource],
  );
  const props = useTable({
    table: 'rancher-catalogs',
    fetchData: createFetcher('rancher-catalogs'),
    exportFields: ['name', 'description', 'catalog_url'],
    exportRow,
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
              clusterUuid: resource.uuid,
              catalogUuid: row.uuid,
              uuid: resource.project_uuid,
            }}
            label={row.name}
          />
        ),
      },
      {
        title: translate('Description'),
        render: ({ row }) => <>{row.description}</>,
      },
      {
        title: translate('URL'),
        render: ({ row }) => <>{row.catalog_url}</>,
      },
    ],
    [resource],
  );
  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('catalogues')}
      actions={<CatalogCreateButton cluster={resource} />}
      hoverableRow={({ row }) =>
        row.scope_type === 'cluster' ? (
          <CatalogDeleteButton catalog={row} />
        ) : null
      }
    />
  );
};
