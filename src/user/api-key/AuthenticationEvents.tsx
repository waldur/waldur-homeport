import { FunctionComponent, useMemo } from 'react';

import { formatRelative } from '@waldur/core/dateUtils';
import eventsRegistry from '@waldur/events/registry';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

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
    fetchData: createFetcher('events'),
    filter,
  });
  return (
    <Table
      {...props}
      title={translate('Authentication events')}
      columns={[
        {
          title: translate('Message'),
          render: ({ row }) => eventsRegistry.formatEvent(row) || 'N/A',
        },
        {
          title: translate('IP address'),
          render: ({ row }) => row.context.ip_address || 'N/A',
        },
        {
          title: translate('Time'),
          render: EventDateField,
          orderField: 'created',
        },
      ]}
      verboseName={translate('Authentication events')}
      fullWidth={true}
    />
  );
};
