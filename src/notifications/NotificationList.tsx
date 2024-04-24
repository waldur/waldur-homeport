import { uniqueId } from 'lodash';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { NotificationActions } from '@waldur/notifications/NotificationActions';
import { NotificationExpandableRow } from '@waldur/notifications/NotificationExpandableRow';
import { NotificationFilter } from '@waldur/notifications/NotificationFilter';
import { createFetcher, Table } from '@waldur/table';
import { BooleanField } from '@waldur/table/BooleanField';
import { useTable } from '@waldur/table/utils';

import { ManageCommonFooterButton } from './ManageCommonFooterButton';

const mapStateToFilter = createSelector(
  getFormValues('notificationFilter'),
  (filters: any) => {
    const result: Record<string, any> = {};
    if (filters?.is_overridden === true) {
      return {
        ...filters,
        is_overridden: true,
      };
    }
    if (filters?.is_overridden === false) {
      return {
        ...filters,
        is_overridden: false,
      };
    }
    return result;
  },
);

export const NotificationList = () => {
  const filter = useSelector(mapStateToFilter);
  const exportRow = (row) => {
    const templatesContent = row.templates.map((template) => template.content);
    return [row.key, ...templatesContent];
  };
  const tableProps = useTable({
    table: 'notification',
    fetchData: createFetcher('notification-messages'),
    filter,
    queryField: 'query',
    exportRow: exportRow,
    exportAll: true,
    exportKeys: ['key', 'templates'],
  });
  const hasOverriddenTemplate = (row) => {
    return row.templates.some((template) => template.is_content_overridden);
  };
  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Notification code'),
          render: ({ row }) => (
            <>
              {row.key}
              {hasOverriddenTemplate(row) && (
                <i className="fa fa-pencil" style={{ marginLeft: '5px' }} />
              )}
              {row.description && (
                <Tip
                  label={row.description}
                  className="ms-2"
                  id={uniqueId('descriptionTip')}
                >
                  <i className="fa fa-question-circle" />
                </Tip>
              )}
            </>
          ),
        },
        {
          title: translate('Created at'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
          orderField: 'created',
        },
        {
          title: translate('Enabled'),
          render: ({ row }) => <BooleanField value={row.enabled} />,
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
      enableExport={true}
      filters={<NotificationFilter />}
    />
  );
};
