import {
  OpenStackNestedInstance,
  OpenStackServerGroup,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { createClientPaginatedFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

interface ServerGroupExpandableRowProps {
  row: OpenStackServerGroup;
}

export const ServerGroupExpandableRow = ({
  row,
}: ServerGroupExpandableRowProps) => {
  const tableProps = useTable({
    table: `server-group-instances-${row.uuid}`,
    fetchData: createClientPaginatedFetcher(row.instances || []),
  });

  return (
    <ExpandableContainer>
      <Table<OpenStackNestedInstance>
        {...tableProps}
        columns={[
          {
            title: translate('Instance name'),
            render: ({ row }) => renderFieldOrDash(row.name),
            copyField: (row) => row.name,
          },
          {
            title: translate('Backend ID'),
            render: ({ row }) => renderFieldOrDash(row.backend_id),
            copyField: (row) => row.backend_id,
          },
        ]}
        verboseName={translate('instances')}
        hasActionBar={false}
        minHeight="auto"
      />
    </ExpandableContainer>
  );
};
