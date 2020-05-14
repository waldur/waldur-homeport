import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { Table, connectTable, createFetcher } from '@waldur/table-react';

const TableComponent = props => {
  const { translate } = props;
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => (
            <Link
              state="rancher-template-details"
              params={{
                uuid: props.resource.project_uuid,
                clusterUuid: props.resource.uuid,
                templateUuid: row.uuid,
              }}
            >
              {row.name}
            </Link>
          ),
        },
        {
          title: translate('Description'),
          render: ({ row }) => <span>{row.description}</span>,
        },
        {
          title: translate('Catalog'),
          render: ({ row }) => <span>{row.catalog_name}</span>,
        },
        {
          title: translate('State'),
          render: ({ row }) => <span>{row.runtime_state}</span>,
        },
      ]}
      verboseName={translate('application templates')}
    />
  );
};

const TableOptions = {
  table: 'rancher-cluster-templates',
  fetchData: createFetcher('rancher-templates'),
  exportFields: ['name', 'description', 'catalog'],
  exportRow: row => [row.name, row.description, row.catalog_name],
  mapPropsToFilter: props => ({
    cluster_uuid: props.resource.uuid,
  }),
};

export const ClusterTemplatesList = connectTable(TableOptions)(TableComponent);
