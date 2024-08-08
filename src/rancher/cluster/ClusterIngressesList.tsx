import { FunctionComponent, useMemo } from 'react';

import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { ImportYAMLButton } from './ImportYAMLButton';
import { IngressActions } from './IngressActions';

export const ClusterIngressesList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    () => ({
      cluster_uuid: resourceScope.uuid,
    }),
    [resourceScope],
  );
  const props = useTable({
    table: 'rancher-ingresses',
    fetchData: createFetcher('rancher-ingresses'),
    filter,
  });
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
        },
        {
          title: translate('Project'),
          render: ({ row }) => <>{row.rancher_project_name}</>,
        },
        {
          title: translate('Namespace'),
          render: ({ row }) => <>{row.namespace_name}</>,
        },
        {
          title: translate('Targets'),
          render: ({ row }) => (
            <>{row.rules.map((rule) => rule.host).join(', ')}</>
          ),
        },
        {
          title: translate('Created'),
          render: ({ row }) => <>{formatDate(row.created)}</>,
        },
        {
          title: translate('State'),
          render: ({ row }) => <>{row.runtime_state}</>,
        },
        {
          title: translate('Actions'),
          render: ({ row }) => <IngressActions ingress={row} />,
        },
      ]}
      verboseName={translate('ingresses')}
      tableActions={<ImportYAMLButton cluster_id={resourceScope.uuid} />}
    />
  );
};
