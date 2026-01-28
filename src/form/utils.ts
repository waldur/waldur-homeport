import { DateTime } from 'luxon';

import { PeriodOption } from '@waldur/form/types';

export const makeLastTwelveMonthsFilterPeriods = (): PeriodOption[] => {
  let date = DateTime.now().startOf('month');
  const choices = [];
  for (let i = 0; i < 12; i++) {
    const month = date.month;
    const year = date.year;
    const label = date.toFormat('MMMM, yyyy');
    choices.push({
      label,
      value: { year, month, current: i === 0 },
    });
    date = date.minus({ months: 1 });
  }
  return choices;
};
