import { FunctionComponent } from 'react';
import { lexisLinksList } from 'waldur-js-client';

import { CopyToClipboardContainer } from '@waldur/core/CopyToClipboardContainer';
import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';
import { LexisLinkDeleteAction } from '@waldur/marketplace/resources/lexis/LexisLinkDeleteButton';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

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
