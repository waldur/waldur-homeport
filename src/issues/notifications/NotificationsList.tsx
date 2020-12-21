import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
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
      verboseName={translate('notifications')}
      actions={<NotificationCreateButton />}
      expandableRow={NotificationExpandableRow}
    />
  );
};

const TableOptions: TableOptionsType = {
  table: 'notifications',
  fetchData: createFetcher('notifications'),
};

const NotificationsListComponent = connectTable(TableOptions)(TableComponent);

export const NotificationsList: FunctionComponent = () => {
  useTitle(translate('Notifications'));
  return (
    <Panel>
      <NotificationsListComponent />
    </Panel>
  );
};
