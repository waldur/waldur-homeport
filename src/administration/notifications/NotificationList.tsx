import { PencilSimpleIcon, QuestionIcon } from '@phosphor-icons/react';
import { uniqueId } from 'lodash-es';
import { useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import { Notification, notificationMessagesList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import { BooleanField } from '@/table/BooleanField';
import {
  NotificationMessagesFilter,
  selectNotificationMessagesFilter,
  NotificationMessagesFilterFormId,
} from '@/table/generated/NotificationMessagesFilter';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { NotificationActions } from './NotificationActions';
import { NotificationExpandableRow } from './NotificationExpandableRow';

const NotificationListTable = () => {
  const { values } = useFormState();

  const filter = useMemo(
    () => selectNotificationMessagesFilter(values),
    [values],
  );

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
      formId={NotificationMessagesFilterFormId}
    />
  );
};

export const NotificationList = (props) => (
  <Form
    id={NotificationMessagesFilterFormId}
    onSubmit={() => {}}
    subscription={{
      values: true,
    }}
  >
    {() => <NotificationListTable {...props} />}
  </Form>
);
