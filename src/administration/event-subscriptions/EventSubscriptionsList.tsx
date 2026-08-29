import { FC } from 'react';
import { EventSubscription, eventSubscriptionsList } from 'waldur-js-client';

import { AlertItem } from '@/core/AlertItem';
import { formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { Column } from '@/table/types';
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

export const EventSubscriptionsList: FC = () => {
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
    <>
      <AlertItem
        variant="warning"
        title={translate('Legacy event subscriptions are deprecated')}
        body={
          <>
            {translate(
              'Per-object-type event subscriptions are superseded by unified event consumers, which receive every enabled event type on a single queue. New integrations should register through /api/event-consumers/ instead.',
            )}{' '}
            <Link state="admin-pubsub-health">
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
    </>
  );
};
