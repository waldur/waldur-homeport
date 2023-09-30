import { FunctionComponent } from 'react';

import { formatShortDateTime } from '@waldur/core/dateUtils';

export const OfferingPeriodsRenderer: FunctionComponent<{ schedules }> = ({
  schedules,
}) => (
  <>
    {schedules
      .filter((s) => s.start)
      .map((schedule, index) => (
        <p key={schedule.id + index} className="m-0">
          {formatShortDateTime(schedule.start)} -{' '}
          {formatShortDateTime(schedule.end)}
          {index + 1 !== schedule.length ? '; ' : null}
        </p>
      ))}
  </>
);
