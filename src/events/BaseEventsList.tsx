import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { formatDateTime } from '@waldur/core/dateUtils';
import eventsRegistry from '@waldur/events/registry';
import { translate } from '@waldur/i18n';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';

import { EventTypesButton } from './EventTypesButton';
import { ExpandableEventDetails } from './ExpandableEventDetails';

const EventDateField = ({ row }) => <>{formatDateTime(row.created)}</>;

export const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      columns={[
        {
          title: translate('Message'),
          render: ({ row }) => eventsRegistry.formatEvent(row),
        },
        {
          title: translate('Timestamp'),
          render: EventDateField,
          orderField: 'created',
        },
      ]}
      hasQuery={true}
      title={translate('Events')}
      verboseName={translate('events')}
      actions={<EventTypesButton />}
      enableExport={true}
      expandableRow={ExpandableEventDetails}
      {...props}
    />
  );
};

export const getEventsList = (extraOptions?: Partial<TableOptionsType>) => {
  const TableOptions = {
    table: 'events',
    fetchData: createFetcher('events'),
    queryField: 'message',
    exportFields: ['message', 'created'],
    exportRow: (row) => [row.message, row.created],
    exportKeys: ['message', 'created'],
    ...extraOptions,
    pullInterval: () => ENV.countersTimerInterval * 1000,
  };

  return connectTable(TableOptions)(TableComponent);
};
