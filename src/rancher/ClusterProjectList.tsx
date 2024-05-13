import { FunctionComponent, useMemo } from 'react';

import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { ProjectExpandableRow } from './ProjectExpandableRow';

export const ClusterProjectList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    () => ({
      cluster_uuid: resourceScope.uuid,
    }),
    [resourceScope],
  );
  const props = useTable({
    table: 'rancher-projects',
    fetchData: createFetcher('rancher-projects'),
    exportFields: ['name', 'description', 'state'],
    exportRow: (row) => [row.name, row.description, row.runtime_state],
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
          title: translate('Description'),
          render: ({ row }) => <>{row.description}</>,
        },
        {
          title: translate('State'),
          render: ({ row }) => <>{row.runtime_state}</>,
        },
      ]}
      verboseName={translate('projects')}
      expandableRow={ProjectExpandableRow}
    />
  );
};
