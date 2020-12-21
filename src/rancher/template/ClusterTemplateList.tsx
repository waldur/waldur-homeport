import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { Table, connectTable, createFetcher } from '@waldur/table';

const TableComponent: FunctionComponent<any> = (props) => {
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
          orderField: 'name',
        },
        {
          title: translate('Description'),
          render: ({ row }) => <>{row.description}</>,
        },
        {
          title: translate('Catalog'),
          render: ({ row }) => <>{row.catalog_name}</>,
          orderField: 'catalog_name',
        },
        {
          title: translate('State'),
          render: ({ row }) => <>{row.runtime_state}</>,
        },
      ]}
      verboseName={translate('application templates')}
      hasQuery={true}
    />
  );
};

const TableOptions = {
  table: 'rancher-cluster-templates',
  fetchData: createFetcher('rancher-templates'),
  exportFields: ['name', 'description', 'catalog'],
  exportRow: (row) => [row.name, row.description, row.catalog_name],
  mapPropsToFilter: (props) => ({
    cluster_uuid: props.resource.uuid,
  }),
  queryField: 'name',
};

export const ClusterTemplatesList = connectTable(TableOptions)(TableComponent);
