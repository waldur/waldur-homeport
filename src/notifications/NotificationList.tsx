import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { NotificationExpandableRow } from '@waldur/notifications/NotificationExpandableRow';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

export const NotificationList = () => {
  const tableProps = useTable({
    table: 'notification',
    fetchData: createFetcher('notification-messages'),
  });
  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Notification code'),
          render: ({ row }) => row.key,
        },
        {
          title: translate('Description'),
          render: ({ row }) => row.description,
        },
        {
          title: translate('Created at'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
          orderField: 'created',
        },
      ]}
      verboseName={translate('notifications')}
      expandableRow={NotificationExpandableRow}
      initialPageSize={10}
      showPageSizeSelector={true}
      expandableRowClassName="bg-gray-200"
      hasQuery={true}
    />
  );
};
