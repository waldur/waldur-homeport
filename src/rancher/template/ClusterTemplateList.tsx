import { FunctionComponent, useMemo } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

const exportFields = ['name', 'description', 'catalog'];

const exportRow = (row) => [row.name, row.description, row.catalog_name];

export const ClusterTemplatesList: FunctionComponent<{ resource }> = ({
  resource,
}) => {
  const filter = useMemo(
    () => ({
      cluster_uuid: resource.uuid,
    }),
    [resource],
  );
  const props = useTable({
    table: 'rancher-cluster-templates',
    fetchData: createFetcher('rancher-templates'),
    exportFields,
    exportRow,
    filter,
    queryField: 'name',
  });
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
                uuid: resource.project_uuid,
                clusterUuid: resource.uuid,
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
