import { FunctionComponent, useMemo } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { Table, connectTable, createFetcher } from '@waldur/table';

import { CatalogCreateButton } from './CatalogCreateButton';
import { CatalogDeleteButton } from './CatalogDeleteButton';

const TableComponent: FunctionComponent<any> = (props) => {
  const columns = useMemo(
    () => [
      {
        title: translate('Name'),
        render: ({ row }) => (
          <Link
            state="rancher-catalog-details"
            params={{
              clusterUuid: props.resource.uuid,
              catalogUuid: row.uuid,
              uuid: props.resource.project_uuid,
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
    [props.resource],
  );
  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('catalogues')}
      actions={<CatalogCreateButton cluster={props.resource} />}
      hoverableRow={({ row }) =>
        row.scope_type === 'cluster' ? (
          <CatalogDeleteButton catalog={row} />
        ) : null
      }
    />
  );
};

const TableOptions = {
  table: 'rancher-catalogs',
  fetchData: createFetcher('rancher-catalogs'),
  exportFields: ['name', 'description', 'catalog_url'],
  exportRow: (row) => [row.name, row.description, row.catalog_url],
  mapPropsToFilter: (props) => ({
    cluster_uuid: props.resource.uuid,
  }),
};

export const ClusterCatalogList = connectTable(TableOptions)(TableComponent);
