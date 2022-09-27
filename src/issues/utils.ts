import { DateTime } from 'luxon';

import { PeriodOption } from '@waldur/form/types';

export const getStartAndEndDatesOfMonth = (period: PeriodOption) => {
  const { year, month } = period;
  const dt = DateTime.fromObject({ year, month });
  return {
    start: dt.startOf('month').toISODate(),
    end: dt.endOf('month').toISODate(),
  };
};
