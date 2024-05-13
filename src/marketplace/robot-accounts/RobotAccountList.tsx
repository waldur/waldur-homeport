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
  });
  const columns = [
    {
      title: translate('Type'),
      render: ({ row }) => row.type || 'N/A',
    },
    {
      title: translate('Username'),
      render: ({ row }) =>
        row.username ? (
          <CopyToClipboardContainer value={row.username} />
        ) : (
          'N/A'
        ),
    },
  ];

  return (
    <Table
      {...tableProps}
      columns={columns}
      verboseName={translate('robot accounts')}
      hasActionBar={false}
      expandableRow={RobotAccountExpandable}
      hoverableRow={({ row }) => (
        <RobotAccountActions refetch={tableProps.fetch} row={row} />
      )}
    />
  );
};
