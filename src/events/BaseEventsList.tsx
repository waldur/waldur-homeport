import * as React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { $sanitize } from '@waldur/core/services';
import eventsRegistry from '@waldur/events/registry';
import { Table, connectTable, createFetcher } from '@waldur/table-react';

import EventDetailsButton from './EventDetailsButton';
import EventTypesButton from './EventTypesButton';

const EventMessageField = ({ row }) => (
  <span dangerouslySetInnerHTML={{__html: $sanitize(eventsRegistry.formatEvent(row))}}/>
);

const EventDateField = ({ row }) => (
  <span>{formatDateTime(row.created)}</span>
);

const TableComponent = props => {
  const { translate } = props;
  return (
    <Table {...props} columns={props.filterColumns([
      {
        title: translate('Message'),
        render: EventMessageField,
      },
      {
        title: translate('Timestamp'),
        render: EventDateField,
        orderField: 'created',
      },
      {
        title: translate('Actions'),
        render: EventDetailsButton,
        className: 'text-center col-md-2',
        visible: props.showActions,
      },
    ])}
    hasQuery={true}
    verboseName={translate('events')}
    actions={<EventTypesButton/>}
    enableExport={true}
    />
  );
};

export const getEventsList = (extraOptions?) => {
  const TableOptions = {
    table: 'events',
    fetchData: createFetcher('events'),
    queryField: 'message',
    exportFields: ['message', 'created'],
    exportRow: row => [row.message, row.created],
    ...extraOptions,
  };

  return connectTable(TableOptions)(TableComponent);
};
