import { FunctionComponent, useMemo } from 'react';
import { eventsList } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import eventsRegistry from '@waldur/events/registry';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { TableProps } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { ExpandableEventDetails } from './ExpandableEventDetails';

const EventDateField = ({ row }) => <>{formatDateTime(row.created)}</>;

export const BaseEventsList: FunctionComponent<Partial<TableProps>> = ({
  filter,
  table,
  title,
  hasActionBar = true,
  ...rest
}) => {
  const options = useMemo(
    () => ({
      table: table || 'events',
      filter,
      fetchData: createFetcher(eventsList),
      queryField: 'message',
    }),
    [table, filter],
  );
  const props = useTable(options);

  return (
    <Table
      columns={[
        {
          title: translate('Message'),
          render: ({ row }) => eventsRegistry.formatEvent(row),
          export: 'message',
        },
        {
          title: translate('User'),
          render: ({ row }) =>
            row.context.user_full_name ||
            row.context.user_username || <>&mdash;</>,
          export: (row) =>
            row.context.user_full_name ||
            row.context.user_username ||
            DASH_ESCAPE_CODE,
          keys: ['context'],
          filter: 'user',
        },
        {
          title: translate('Timestamp'),
          render: EventDateField,
          orderField: 'created',
          export: 'created',
        },
      ]}
      hasQuery={true}
      hasActionBar={hasActionBar}
      title={title || translate('Events')}
      verboseName={translate('events')}
      enableExport={true}
      expandableRow={ExpandableEventDetails}
      {...props}
      {...rest}
    />
  );
};
