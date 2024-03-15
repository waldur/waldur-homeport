import { DateTime } from 'luxon';

export const makeAccountingPeriods = (start: DateTime) => {
  let date = DateTime.now().startOf('month');
  const diff = date.diff(start, 'months');
  const choices = [];
  for (let i = 0; i <= diff.months; i++) {
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
