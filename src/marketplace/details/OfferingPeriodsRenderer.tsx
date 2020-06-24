import * as React from 'react';

import { formatShortDateTime } from '@waldur/core/dateUtils';

export const OfferingPeriodsRenderer = ({ schedules }) => (
  <>
    {schedules.map((schedule, index) => (
      <span key={schedule.id}>
        {formatShortDateTime(schedule.start)} -{' '}
        {formatShortDateTime(schedule.end)}
        {index + 1 !== schedule.length ? '; ' : null}
      </span>
    ))}
  </>
);
