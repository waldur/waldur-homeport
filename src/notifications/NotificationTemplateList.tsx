import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { NotificationTemplateActions } from '@waldur/notifications/NotificationTemplateActions';
import { NotificationTemplateCreateButton } from '@waldur/notifications/NotificationTemplateCreateButton';
import { NotificationTemplateExpandableRow } from '@waldur/notifications/NotificationTemplateExpandableRow';
import { connectTable, createFetcher, Table } from '@waldur/table';
import { TableProps } from '@waldur/table/Table';
import { TableOptionsType } from '@waldur/table/types';

const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => row.name,
          orderField: 'name',
        },
        {
          title: translate('Subject'),
          render: ({ row }) => row.subject,
          orderField: 'subject',
        },
      ]}
      verboseName={translate('notification-templates')}
      actions={<NotificationTemplateCreateButton refetch={props.fetch} />}
      expandableRow={NotificationTemplateExpandableRow}
      initialPageSize={10}
      showPageSizeSelector={true}
      expandableRowClassName="bg-gray-200"
      hoverableRow={NotificationTemplateActions}
      hasQuery={true}
    />
  );
};

const TableOptions: TableOptionsType = {
  table: 'broadcast-templates',
  fetchData: createFetcher('broadcast-message-templates'),
  queryField: 'subject',
};

export const NotificationTemplateList = connectTable(TableOptions)(
  TableComponent,
) as React.ComponentType<Partial<TableProps>>;
