import { FunctionComponent } from 'react';
import { lexisLinksList } from 'waldur-js-client';

import { CopyToClipboardContainer } from '@/core/CopyToClipboardContainer';
import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';
import { LexisLinkDeleteAction } from '@/marketplace/resources/lexis/LexisLinkDeleteButton';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

export const BasicLexisLinkList: FunctionComponent<{ filter? }> = ({
  filter,
}) => {
  const props = useTable({
    table: 'lexis-links',
    fetchData: createFetcher(lexisLinksList),
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
      render: ({ row }) => renderFieldOrDash(row.robot_account_type),
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
          outline
          pill
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
        <ActionsDropdown row={row} refetch={props.fetch}>
          <LexisLinkDeleteAction row={row} refetch={props.fetch} />
        </ActionsDropdown>
      )}
      title={translate('LEXIS links')}
      hasQuery={true}
    />
  );
};
