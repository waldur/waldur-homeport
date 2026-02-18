import { useCallback } from 'react';
import {
  OpenStackNestedInstance,
  OpenStackServerGroup,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

interface ServerGroupExpandableRowProps {
  row: OpenStackServerGroup;
}

export const ServerGroupExpandableRow = ({
  row,
}: ServerGroupExpandableRowProps) => {
  const fetchData = useCallback(
    () =>
      Promise.resolve({
        rows: row.instances || [],
        resultCount: row.instances?.length || 0,
      }),
    [row.instances],
  );

  const tableProps = useTable({
    table: `server-group-instances-${row.uuid}`,
    fetchData,
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
