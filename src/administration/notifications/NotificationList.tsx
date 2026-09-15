import { PencilSimpleIcon, QuestionIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { Notification, notificationMessagesList } from 'waldur-js-client';

import { Tooltip } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import { BooleanField } from '@/table/BooleanField';
import {
  NotificationMessagesFilter,
  selectNotificationMessagesFilter,
  NotificationMessagesFilterFormId,
} from '@/table/generated/NotificationMessagesFilter';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';

import { NotificationActions } from './NotificationActions';
import { NotificationExpandableRow } from './NotificationExpandableRow';

export const NotificationList = () => {
  const values = useFilterValues('notification');

  const filter = useMemo(
    () => selectNotificationMessagesFilter(values),
    [values],
  );

  const tableProps = useTable({
    table: 'notification',
    syncFiltersToURL: true,
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
                <Tooltip label={translate('Content is overridden')}>
                  <PencilSimpleIcon
                    weight="bold"
                    className="svg-icon svg-icon-5 ms-3"
                  />
                </Tooltip>
              )}
              {row.description && (
                <Tooltip label={row.description}>
                  <QuestionIcon weight="bold" className="ms-2" />
                </Tooltip>
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
      formId={NotificationMessagesFilterFormId}
    />
  );
};
