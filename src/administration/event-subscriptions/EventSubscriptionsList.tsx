import { FC } from 'react';
import { EventSubscription, eventSubscriptionsList } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { Column, TableWithPortal } from '@/table/types';
import { useTable } from '@/table/useTable';

import { EventSubscriptionCreateButton } from './EventSubscriptionCreateButton';
import { EventSubscriptionExpandableRow } from './EventSubscriptionExpandableRow';
import { EventSubscriptionRowActions } from './EventSubscriptionRowActions';

const mandatoryFields: Array<keyof EventSubscription> = [
  'uuid',
  'url',
  'description',
  'user',
  'user_uuid',
  'user_username',
  'user_full_name',
  'observable_objects',
  'created',
  'modified',
  'source_ip',
];

export const EventSubscriptionsList: FC<Partial<TableWithPortal>> = ({
  portal,
}) => {
  const tableProps = useTable({
    table: 'EventSubscriptionsList',
    fetchData: createFetcher(eventSubscriptionsList),
    queryField: 'user_username',
    mandatoryFields,
  });

  const columns: Column<EventSubscription>[] = [
    {
      title: translate('UUID'),
      render: ({ row }) => (
        <code className="text-muted">{row.uuid.substring(0, 8)}...</code>
      ),
      copyField: (row) => row.uuid,
      keys: ['uuid'],
      id: 'uuid',
    },
    {
      title: translate('User'),
      render: ({ row }) => (
        <span className="fw-bold">
          {row.user_full_name || row.user_username}
        </span>
      ),
      keys: ['user_full_name', 'user_username'],
      id: 'user',
    },
    {
      title: translate('Description'),
      render: ({ row }) => <>{row.description || DASH_ESCAPE_CODE}</>,
      keys: ['description'],
      id: 'description',
    },
    {
      title: translate('Source IP'),
      render: ({ row }) => (
        <code className="text-muted">{row.source_ip || DASH_ESCAPE_CODE}</code>
      ),
      keys: ['source_ip'],
      id: 'source_ip',
    },
    {
      title: translate('Created'),
      render: ({ row }) => <>{formatDateTime(row.created)}</>,
      keys: ['created'],
      id: 'created',
    },
    {
      title: translate('Modified'),
      render: ({ row }) => <>{formatDateTime(row.modified)}</>,
      keys: ['modified'],
      id: 'modified',
    },
  ];

  return (
    // `pt-5`: the spacing contract for a TableWithTabs pane, as in
    // RoleHygienePage; without it the notice butts up against the tab strip.
    <div className="pt-5">
      <AlertItem
        variant="warning"
        title={translate('Legacy event subscriptions are deprecated')}
        body={
          <>
            {translate(
              'Per-object-type event subscriptions are superseded by unified event consumers, which receive every enabled event type on a single queue. New integrations should register through /api/event-consumers/ instead.',
            )}{' '}
            <Link state="admin-workers" params={{ tab: 'pubsub' }}>
              {translate('View event consumers')}
            </Link>
            {' · '}
            <Link state="admin-site-agents">
              {translate('View site agents')}
            </Link>
          </>
        }
      />
      <Table<EventSubscription>
        {...tableProps}
        columns={columns}
        title={translate('Event subscriptions (legacy)')}
        verboseName={translate('Event subscription')}
        // Rendered only as a tab of the workers & messaging page, whose card
        // and toolbar these controls belong to.
        portal={portal}
        hasActionBar={false}
        cardBordered={false}
        fullWidth
        hasQuery
        enableExport
        expandableRow={EventSubscriptionExpandableRow}
        rowActions={({ row }) => (
          <EventSubscriptionRowActions row={row} refetch={tableProps.fetch} />
        )}
        tableActions={
          <EventSubscriptionCreateButton refetch={tableProps.fetch} />
        }
      />
    </div>
  );
};
