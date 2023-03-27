import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';

import { NotificationCreateButton } from './NotificationCreateButton';
import { NotificationExpandableRow } from './NotificationExpandableRow';
import { NotificationSendButton } from './NotificationSendButton';
import { NotificationUpdateButton } from './NotificationUpdateButton';
import { NotificationResponseData } from './types';

const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Author'),
          render: ({ row }: { row: NotificationResponseData }) =>
            row.author_full_name,
          orderField: 'author_full_name',
        },
        {
          title: translate('Subject'),
          render: ({ row }: { row: NotificationResponseData }) => row.subject,
          orderField: 'subject',
        },
        {
          title: translate('State'),
          render: ({ row }: { row: NotificationResponseData }) => (
            <StateIndicator
              label={translate(row.state)}
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
          render: ({ row }) => formatDateTime(row.created),
          orderField: 'created',
        },
      ]}
      verboseName={translate('notifications')}
      actions={<NotificationCreateButton refetch={props.fetch} />}
      expandableRow={NotificationExpandableRow}
      expandableRowClassName="bg-gray-200"
      hoverableRow={({ row }) =>
        row.state === 'DRAFT' ? (
          <>
            <NotificationUpdateButton
              notification={row}
              refetch={props.fetch}
            />
            <NotificationSendButton notification={row} refetch={props.fetch} />
          </>
        ) : null
      }
      hasQuery={true}
    />
  );
};

const TableOptions: TableOptionsType = {
  table: 'broadcast',
  fetchData: createFetcher('broadcast-messages'),
  queryField: 'subject',
};

export const NotificationList = connectTable(TableOptions)(TableComponent);
