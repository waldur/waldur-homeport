import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { NotificationActions } from '@waldur/notifications/NotificationActions';
import { NotificationExpandableRow } from '@waldur/notifications/NotificationExpandableRow';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { ManageCommonFooterButton } from './ManageCommonFooterButton';

export const NotificationList = () => {
  const tableProps = useTable({
    table: 'notification',
    fetchData: createFetcher('notification-messages'),
    queryField: 'query',
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
      hoverableRow={({ row }) => (
        <NotificationActions row={row} refetch={tableProps.fetch} />
      )}
      initialPageSize={10}
      showPageSizeSelector={true}
      expandableRowClassName="bg-gray-200"
      hasQuery={true}
      actions={<ManageCommonFooterButton refetch={tableProps.fetch} />}
    />
  );
};
