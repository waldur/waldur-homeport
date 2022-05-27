import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { useSupportItems } from '@waldur/navigation/navitems';
import { useTitle } from '@waldur/navigation/title';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';

import { NotificationCreateButton } from './NotificationCreateButton';
import { NotificationExpandableRow } from './NotificationExpandableRow';

const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Author'),
          render: ({ row }) => row.author_full_name,
          orderField: 'author_full_name',
        },
        {
          title: translate('Subject'),
          render: ({ row }) => row.subject,
          orderField: 'subject',
        },
        {
          title: translate('Created at'),
          render: ({ row }) => formatDateTime(row.created),
          orderField: 'created',
        },
      ]}
      verboseName={translate('broadcast')}
      actions={<NotificationCreateButton />}
      expandableRow={NotificationExpandableRow}
      hasQuery={true}
    />
  );
};

const TableOptions: TableOptionsType = {
  table: 'broadcast',
  fetchData: createFetcher('notifications'),
  queryField: 'subject',
};

const BroadcastListComponent = connectTable(TableOptions)(TableComponent);

export const BroadcastList: FunctionComponent = () => {
  useTitle(translate('Broadcast'));
  useSupportItems();
  return <BroadcastListComponent />;
};
