import { FC, useMemo } from 'react';
import { Offering } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { BaseEventsList } from '@waldur/events/BaseEventsList';
import eventsRegistry from '@waldur/events/registry';
import { translate } from '@waldur/i18n';
import { TableProps } from '@waldur/table/types';

interface OfferingEventsListProps extends Partial<TableProps> {
  offering: Offering;
  compact: boolean;
}

const compactColumns = [
  {
    title: translate('Timestamp'),
    render: ({ row }) => formatDateTime(row.created),
    orderField: 'created',
    export: 'created',
  },
  {
    title: translate('Activity'),
    render: ({ row }) => eventsRegistry.formatEvent(row),
    export: 'message',
  },
];

export const OfferingEventsList: FC<OfferingEventsListProps> = ({
  offering,
  title = translate('Events'),
  compact = false,
  ...props
}) => {
  const filter = useMemo(() => ({ scope: offering.url }), [offering]);
  return (
    <BaseEventsList
      filter={filter}
      table={`events-${offering.uuid}`}
      title={title}
      id="events"
      {...props}
      {...(compact
        ? {
            columns: compactColumns,
            hideRefresh: true,
            enableExport: false,
            hasQuery: false,
            expandableRow: null,
            showPageSizeSelector: true,
          }
        : {})}
    />
  );
};
