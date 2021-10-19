import { DateTime } from 'luxon';

import { PeriodOption } from '@waldur/form/types';

export const reactSelectMenuPortaling = (): any => ({
  menuPortalTarget: document.body,
  styles: { menuPortal: (base) => ({ ...base, zIndex: 9999 }) },
  menuPosition: 'fixed',
  menuPlacement: 'bottom',
});

export const datePickerOverlayContainerInDialogs = () => ({
  calendarPlacement: 'bottom',
  calendarContainer: document.getElementsByClassName('modal-dialog')[0],
});

export const makeLastTwelveMonthsFilterPeriods = (): PeriodOption[] => {
  let date = DateTime.now().startOf('month');
  const choices = [];
  for (let i = 0; i < 12; i++) {
    const month = date.month;
    const year = date.year;
    const label = date.toFormat('MMMM, YYYY');
    choices.push({
      label,
      value: { year, month, current: i === 0 },
    });
    date = date.minus({ months: 1 });
  }
  return choices;
};
