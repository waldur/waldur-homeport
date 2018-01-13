import * as React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { eventFormatter } from '@waldur/events/services';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { getUser } from '@waldur/workspace/selectors';

import EventDetailsButton from './EventDetailsButton';
import EventTypesButton from './EventTypesButton';

const EventMessageField = ({ row }) => (
  <span dangerouslySetInnerHTML={{__html: eventFormatter.format(row)}}/>
);

const EventDateField = ({ row }) => (
  <span>{formatDateTime(row['@timestamp'])}</span>
);

const TableComponent = props => {
  const { translate } = props;
  return (
    <Table {...props} columns={[
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
      },
    ]}
    hasQuery={true}
    verboseName={translate('events')}
    actions={<EventTypesButton/>}/>
  );
};

const TableOptions = {
  table: 'userEvents',
  fetchData: createFetcher('events'),
  getDefaultFilter: state => ({
    scope: getUser(state).url,
    feature: 'users',
    exclude_extra: true,
  }),
  queryField: 'search',
  exportFields: ['message', 'timestamp'],
  exportRow: row => [row.message, row['@timestamp']],
};

export default connectTable(TableOptions)(TableComponent);
