import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';
import { Table, connectTable, createFetcher } from '@waldur/table-react';

import { CatalogCreateButton } from './CatalogCreateButton';

const TableComponent = props => {
  const { translate } = props;
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <span>{row.name}</span>,
        },
        {
          title: translate('Description'),
          render: ({ row }) => <span>{row.description}</span>,
        },
        {
          title: translate('URL'),
          render: ({ row }) => <span>{row.catalog_url}</span>,
        },
      ]}
      verboseName={translate('catalogs')}
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

const ClusterCatalogList = connectTable(TableOptions)(TableComponent);

export default connectAngularComponent(ClusterCatalogList, ['resource']);
