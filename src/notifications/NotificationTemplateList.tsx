import { translate } from '@waldur/i18n';
import { NotificationTemplateActions } from '@waldur/notifications/NotificationTemplateActions';
import { NotificationTemplateCreateButton } from '@waldur/notifications/NotificationTemplateCreateButton';
import { NotificationTemplateExpandableRow } from '@waldur/notifications/NotificationTemplateExpandableRow';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

export const NotificationTemplateList = () => {
  const tableProps = useTable({
    table: 'broadcast-templates',
    fetchData: createFetcher('broadcast-message-templates'),
  });
  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => row.name,
        },
        {
          title: translate('Subject'),
          render: ({ row }) => row.subject,
        },
      ]}
      verboseName={translate('notification templates')}
      actions={<NotificationTemplateCreateButton refetch={tableProps.fetch} />}
      expandableRow={NotificationTemplateExpandableRow}
      initialPageSize={10}
      showPageSizeSelector={true}
      expandableRowClassName="bg-gray-200"
      hoverableRow={({ row }) => (
        <NotificationTemplateActions row={row} refetch={tableProps.fetch} />
      )}
      hasQuery={true}
    />
  );
};
