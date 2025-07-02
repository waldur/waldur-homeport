import { FunctionComponent, useMemo } from 'react';

import { CopyToClipboardContainer } from '@waldur/core/CopyToClipboardContainer';
import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { RobotAccountActions } from './RobotAccountActions';
import { RobotAccountExpandable } from './RobotAccountExpandable';

export const RobotAccountList: FunctionComponent<{ resource }> = ({
  resource,
}) => {
  const filter = useMemo(() => ({ resource: resource.url }), [resource]);
  const tableProps = useTable({
    table: 'marketplace-robot-accounts',
    fetchData: createFetcher('marketplace-robot-accounts'),
    filter,
    queryField: 'type',
  });
  const columns = [
    {
      title: translate('Type'),
      render: ({ row }) => row.type || 'N/A',
      export: 'type',
    },
    {
      title: translate('Username'),
      render: ({ row }) =>
        row.username ? (
          <CopyToClipboardContainer value={row.username} />
        ) : (
          'N/A'
        ),

      export: 'username',
    },
    {
      title: translate('State'),
      render: ({ row }) => (
        <StateIndicator
          label={row.state}
          variant={
            row.state === 'ERRED'
              ? 'danger'
              : row.state === 'CREATING' || row.state === 'REQUESTED_DELETION'
                ? 'warning'
                : 'primary'
          }
          outline
          pill
        />
      ),
    },
  ];

  return (
    <Table
      {...tableProps}
      columns={columns}
      hasQuery={true}
      enableExport={true}
      verboseName={translate('robot accounts')}
      expandableRow={RobotAccountExpandable}
      rowActions={({ row }) => (
        <RobotAccountActions refetch={tableProps.fetch} row={row} />
      )}
    />
  );
};
