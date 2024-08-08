import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { BroadcastCreateButton } from './BroadcastCreateButton';
import { BroadcastExpandableRow } from './BroadcastExpandableRow';
import { BroadcastSendButton } from './BroadcastSendButton';
import { BroadcastUpdateButton } from './BroadcastUpdateButton';
import { BroadcastResponseData } from './types';

export const BroadcastList: FunctionComponent<{}> = () => {
  const props = useTable({
    table: 'broadcast',
    fetchData: createFetcher('broadcast-messages'),
    queryField: 'subject',
  });
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Author'),
          render: ({ row }: { row: BroadcastResponseData }) => (
            <>{row.author_full_name}</>
          ),
          orderField: 'author_full_name',
        },
        {
          title: translate('Subject'),
          render: ({ row }: { row: BroadcastResponseData }) => (
            <>{row.subject}</>
          ),
          orderField: 'subject',
        },
        {
          title: translate('State'),
          render: ({ row }: { row: BroadcastResponseData }) => (
            <StateIndicator
              label={row.state}
              variant={
                row.state === 'DRAFT'
                  ? 'dark'
                  : row.state === 'SENT'
                    ? 'success'
                    : 'info'
              }
            />
          ),
        },
        {
          title: translate('Created at'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
          orderField: 'created',
        },
      ]}
      verboseName={translate('broadcasts')}
      tableActions={<BroadcastCreateButton refetch={props.fetch} />}
      expandableRow={BroadcastExpandableRow}
      initialPageSize={10}
      showPageSizeSelector={true}
      expandableRowClassName="bg-gray-200"
      rowActions={({ row }) =>
        row.state === 'DRAFT' ? (
          <>
            <BroadcastUpdateButton broadcast={row} refetch={props.fetch} />
            <BroadcastSendButton broadcast={row} refetch={props.fetch} />
          </>
        ) : null
      }
      hasQuery={true}
      title={translate('Broadcasts')}
      standalone
    />
  );
};
