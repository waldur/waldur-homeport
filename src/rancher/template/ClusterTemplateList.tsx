import { FunctionComponent, useMemo } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

export const ClusterTemplatesList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    () => ({
      cluster_uuid: resourceScope.uuid,
    }),
    [resourceScope],
  );
  const props = useTable({
    table: 'rancher-cluster-templates',
    fetchData: createFetcher('rancher-templates'),
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
                uuid: resourceScope.project_uuid,
                clusterUuid: resourceScope.uuid,
                templateUuid: row.uuid,
              }}
            >
              {row.name}
            </Link>
          ),
          orderField: 'name',
          export: 'name',
        },
        {
          title: translate('Description'),
          render: ({ row }) => <>{row.description}</>,
          export: 'description',
        },
        {
          title: translate('Catalog'),
          render: ({ row }) => <>{row.catalog_name}</>,
          orderField: 'catalog_name',
          export: 'catalog_name',
        },
        {
          title: translate('State'),
          render: ({ row }) => <>{row.runtime_state}</>,
          export: 'runtime_state',
        },
      ]}
      verboseName={translate('application templates')}
      hasQuery={true}
    />
  );
};
