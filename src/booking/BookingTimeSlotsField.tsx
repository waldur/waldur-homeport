import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Tooltip } from '@waldur/core/Tooltip';

const wrapScheduleTitleTooltip = (label, children) =>
  label ? (
    <Tooltip label={label} id="schedule-title-label">
      {children}
    </Tooltip>
  ) : (
    children
  );

export const BookingTimeSlotsField: FunctionComponent<{ row }> = ({ row }) =>
  row.attributes.schedules.map((schedule) => (
    <span key={schedule.id} style={{ display: 'block' }}>
      {wrapScheduleTitleTooltip(
        schedule.title,
        <>
          {formatDateTime(schedule.start)}
          {' - '}
          {formatDateTime(schedule.end)}
        </>,
      )}
    </span>
  ));
