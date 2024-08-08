import { FunctionComponent } from 'react';

import { CopyToClipboardContainer } from '@waldur/core/CopyToClipboardContainer';
import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';
import { LexisLinkDeleteButton } from '@waldur/marketplace/resources/lexis/LexisLinkDeleteButton';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

export const BasicLexisLinkList: FunctionComponent<{ filter? }> = ({
  filter,
}) => {
  const props = useTable({
    table: 'lexis-links',
    fetchData: createFetcher('lexis-links'),
    filter,
    queryField: 'query',
  });
  const columns = [
    {
      title: translate('Robot account'),
      render: ({ row }) =>
        row.robot_account_username ? (
          <CopyToClipboardContainer value={row.robot_account_username} />
        ) : (
          'N/A'
        ),
    },
    {
      title: translate('Robot account type'),
      render: ({ row }) => row.robot_account_type || 'N/A',
    },
    {
      title: translate('State'),
      render: ({ row }) => (
        <StateIndicator
          label={row.state}
          variant={
            row.state === 'erred'
              ? 'danger'
              : row.state === 'pending'
                ? 'warning'
                : 'primary'
          }
        />
      ),
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('LEXIS links')}
      rowActions={({ row }) => (
        <LexisLinkDeleteButton row={row} refetch={props.fetch} />
      )}
      title={translate('LEXIS links')}
      hasQuery={true}
    />
  );
};
