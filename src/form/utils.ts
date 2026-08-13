import { DateTime } from 'luxon';

import { PeriodOption } from '@/form/types';

/**
 * `parse` for controls whose column is a non-nullable `CharField(blank=True)`.
 *
 * Selects hand back `null` when cleared and React Final Form parses an emptied
 * text input to `undefined`; the first is rejected with "This field may not be
 * null.", and the second is dropped by `JSON.stringify` so the update silently
 * keeps the old value. A blank string is what those columns actually accept.
 */
export const clearToBlank = (value: any) => value ?? '';

export const makeLastTwelveMonthsFilterPeriods = (): {
  label: string;
  value: PeriodOption;
}[] => {
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
