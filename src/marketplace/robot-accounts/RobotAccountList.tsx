import { FunctionComponent, useMemo } from 'react';

import { CopyToClipboardContainer } from '@waldur/core/CopyToClipboardContainer';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

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
  ];

  return (
    <Table
      {...tableProps}
      columns={columns}
      hasQuery={true}
      enableExport={true}
      verboseName={translate('robot accounts')}
      expandableRow={RobotAccountExpandable}
      hoverableRow={({ row }) => (
        <RobotAccountActions refetch={tableProps.fetch} row={row} />
      )}
    />
  );
};
