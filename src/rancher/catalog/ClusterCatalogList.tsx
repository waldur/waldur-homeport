import { FunctionComponent, useMemo } from 'react';
import { RancherCatalog, rancherCatalogsList } from 'waldur-js-client';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column, TableWithPortal } from '@/table/types';
import { useTable } from '@/table/useTable';

import { CatalogCreateButton } from './CatalogCreateButton';
import { CatalogDeleteAction } from './CatalogDeleteButton';

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
    fetchData: createFetcher(rancherCatalogsList),
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
          <ActionsDropdown row={row} refetch={props.fetch}>
            <CatalogDeleteAction row={row} refetch={props.fetch} />
          </ActionsDropdown>
        ) : null
      }
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
    />
  );
};
