import { PencilSimpleIcon, QuestionIcon } from '@phosphor-icons/react';
import { uniqueId } from 'lodash-es';
import { useSelector } from 'react-redux';
import { Notification, notificationMessagesList } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import { BooleanField } from '@waldur/table/BooleanField';
import {
  NotificationMessagesFilter,
  selectNotificationMessagesFilter,
} from '@waldur/table/generated/NotificationMessagesFilter';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { NotificationActions } from './NotificationActions';
import { NotificationExpandableRow } from './NotificationExpandableRow';

export const NotificationList = () => {
  const filter = useSelector(selectNotificationMessagesFilter);
  const tableProps = useTable({
    table: 'notification',
    fetchData: createFetcher(notificationMessagesList),
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
                <Tip
                  id={'tip-notif-overridden-' + row.uuid}
                  label={translate('Content is overridden')}
                  className="svg-icon svg-icon-5 ms-3"
                >
                  <PencilSimpleIcon weight="bold" />
                </Tip>
              )}
              {row.description && (
                <Tip
                  label={row.description}
                  className="ms-2"
                  id={uniqueId('descriptionTip')}
                >
                  <QuestionIcon weight="bold" />
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
      hasQuery={true}
      enableExport={true}
      filters={<NotificationMessagesFilter />}
    />
  );
};
