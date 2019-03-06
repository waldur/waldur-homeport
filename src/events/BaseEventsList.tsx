import * as React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import eventsRegistry from '@waldur/events/registry';
import { Table, connectTable, createFetcher } from '@waldur/table-react';

import EventDetailsButton from './EventDetailsButton';
import EventTypesButton from './EventTypesButton';

const EventMessageField = ({ row }) => (
  <span dangerouslySetInnerHTML={{__html: eventsRegistry.formatEvent(row)}}/>
);

const EventDateField = ({ row }) => (
  <span>{formatDateTime(row['@timestamp'])}</span>
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
    queryField: 'search',
    exportFields: ['message', 'timestamp'],
    exportRow: row => [row.message, row['@timestamp']],
    ...extraOptions,
  };

  return connectTable(TableOptions)(TableComponent);
};
