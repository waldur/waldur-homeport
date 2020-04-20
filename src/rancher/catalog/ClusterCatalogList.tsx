import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { Table, connectTable, createFetcher } from '@waldur/table-react';

import { CatalogCreateButton } from './CatalogCreateButton';
import { CatalogDeleteButton } from './CatalogDeleteButton';

const TableComponent = props => {
  const { translate } = props;
  const columns = React.useMemo(
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
        render: ({ row }) => <span>{row.description}</span>,
      },
      {
        title: translate('URL'),
        render: ({ row }) => <span>{row.catalog_url}</span>,
      },
      {
        title: translate('Actions'),
        render: ({ row }) =>
          row.scope_type === 'cluster' ? (
            <CatalogDeleteButton catalog={row} />
          ) : (
            'N/A'
          ),
      },
    ],
    [translate, props.resource],
  );
  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('catalogues')}
      actions={<CatalogCreateButton cluster={props.resource} />}
    />
  );
};

const TableOptions = {
  table: 'rancher-catalogs',
  fetchData: createFetcher('rancher-catalogs'),
  exportFields: ['name', 'description', 'catalog_url'],
  exportRow: row => [row.name, row.description, row.catalog_url],
  mapPropsToFilter: props => ({
    cluster_uuid: props.resource.uuid,
  }),
};

export const ClusterCatalogList = connectTable(TableOptions)(TableComponent);
