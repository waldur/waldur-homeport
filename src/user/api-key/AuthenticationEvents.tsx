import { FunctionComponent } from 'react';

import { formatRelative } from '@waldur/core/dateUtils';
import eventsRegistry from '@waldur/events/registry';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';
import { UserDetails } from '@waldur/workspace/types';

interface AuthenticationEventsProps {
  user: UserDetails;
}

const EventDateField = ({ row }) => <>{formatRelative(row.created)}</>;

const TableComponent: FunctionComponent<any> = (props) => {
  const { translate } = props;
  return (
    <Table
      {...props}
      title={translate('Authentication events')}
      columns={props.filterColumns([
        {
          title: translate('Message'),
          render: ({ row }) => eventsRegistry.formatEvent(row),
        },
        {
          title: translate('IP address'),
          render: ({ row }) => row.context.ip_address,
        },
        {
          title: translate('Time'),
          render: EventDateField,
          orderField: 'created',
        },
      ])}
      verboseName={translate('Authentication events')}
      fullWidth={true}
      hasActions={false}
    />
  );
};

const TableOptions: TableOptionsType = {
  table: 'authentication-events',
  fetchData: createFetcher('events'),
  mapPropsToFilter: (props: AuthenticationEventsProps) => ({
    scope: props.user.url,
    feature: 'users',
  }),
  mapPropsToTableId: (props: AuthenticationEventsProps) => [
    'authentication-events',
    props.user.uuid,
  ],
};

export const AuthenticationEvents = connectTable(TableOptions)(TableComponent);
