import { PencilSimpleIcon, QuestionIcon } from '@phosphor-icons/react';
import { uniqueId } from 'lodash-es';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { Notification } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import { BooleanField } from '@waldur/table/BooleanField';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { NotificationActions } from './NotificationActions';
import { NotificationExpandableRow } from './NotificationExpandableRow';
import { NotificationFilter } from './NotificationFilter';

export const NotificationList = () => {
  const filter = useSelector(getFormValues('notificationFilter'));
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
    <Table<Notification>
      {...tableProps}
      columns={[
        {
          title: translate('Notification code'),
          render: ({ row }) => (
            <>
              {row.key}
              {hasOverriddenTemplate(row) && (
                <span className="svg-icon svg-icon-5 ms-3">
                  <PencilSimpleIcon />
                </span>
              )}
              {row.description && (
                <Tip
                  label={row.description}
                  className="ms-2"
                  id={uniqueId('descriptionTip')}
                >
                  <QuestionIcon />
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
      rowActions={({ row }) => (
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
