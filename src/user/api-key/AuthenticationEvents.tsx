import { FunctionComponent, useMemo } from 'react';
import { Event, eventsList } from 'waldur-js-client';

import { formatRelative } from '@waldur/core/dateUtils';
import eventsRegistry from '@waldur/events/registry';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

const EventDateField = ({ row }) => <>{formatRelative(row.created)}</>;

export const AuthenticationEvents: FunctionComponent<{ user }> = ({ user }) => {
  const filter = useMemo(
    () => ({
      scope: user.url,
      feature: 'users',
    }),
    [user],
  );
  const props = useTable({
    table: `authentication-events-${user.uuid}`,
    fetchData: createFetcher(eventsList),
    filter,
  });
  return (
    <Table<Event>
      {...props}
      title={translate('Authentication events')}
      columns={[
        {
          title: translate('Message'),
          render: ({ row }) =>
            renderFieldOrDash(eventsRegistry.formatEvent(row)),
        },
        {
          title: translate('IP address'),
          render: ({ row }) => renderFieldOrDash(row.context['ip_address']),
        },
        {
          title: translate('Time'),
          render: EventDateField,
          orderField: 'created',
        },
      ]}
      verboseName={translate('Authentication events')}
    />
  );
};
