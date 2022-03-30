import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Tip } from '@waldur/core/Tooltip';

import { BookingResource } from './types';

export const wrapScheduleTitleTooltip = (label: string, children) =>
  label ? (
    <Tip label={label} id="schedule-title-label">
      {children}
    </Tip>
  ) : (
    children
  );

export const BookingTimeSlotsField: FunctionComponent<{
  row: BookingResource;
}> = ({ row }) => (
  <>
    {row.attributes.schedules.map((schedule) => (
      <div key={schedule.id}>
        {wrapScheduleTitleTooltip(
          schedule.title,
          <>
            {formatDateTime(schedule.start)}
            {' - '}
            {formatDateTime(schedule.end)}
          </>,
        )}
      </div>
    ))}
  </>
);
