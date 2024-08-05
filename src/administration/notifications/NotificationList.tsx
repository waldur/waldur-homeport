import { Question } from '@phosphor-icons/react';
import { uniqueId } from 'lodash';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { createFetcher, Table } from '@waldur/table';
import { BooleanField } from '@waldur/table/BooleanField';
import { useTable } from '@waldur/table/utils';

import { NotificationActions } from './NotificationActions';
import { NotificationExpandableRow } from './NotificationExpandableRow';
import { NotificationFilter } from './NotificationFilter';

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
  const tableProps = useTable({
    table: 'notification',
    fetchData: createFetcher('notification-messages'),
    filter,
    queryField: 'query',
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
                  <Question />
                </Tip>
              )}
            </>
          ),
          export: 'key',
        },
        {
          title: translate('Created at'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
          orderField: 'created',
          export: false,
        },
        {
          title: translate('Enabled'),
          render: ({ row }) => <BooleanField value={row.enabled} />,
          export: false,
        },
        {
          visible: false,
          title: translate('Templates'),
          render: null,
          export: (row) =>
            JSON.stringify(row.templates.map((template) => template.content)),
          exportKeys: ['templates'],
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
      enableExport={true}
      filters={<NotificationFilter />}
    />
  );
};
