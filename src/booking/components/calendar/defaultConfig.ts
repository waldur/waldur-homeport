import { OptionsInput } from '@fullcalendar/core';

import { translate } from '@waldur/i18n';

export const defaultConfig: OptionsInput = {
  defaultView: 'dayGridMonth',
  themeSystem: 'bootstrap',
  height: 'auto',
  titleFormat: {
    month: 'short',
    year: 'numeric',
    day: 'numeric',
  },
  views: {
    week: {
      columnHeaderFormat: 'ddd D/M',
    },
  },
  timeZone: 'local', //'UTC',
  firstDay: 1,
  editable: false,
  selectable: true,
  eventOverlap: false,
  eventResizableFromStart: true,
  eventLimit: false,
  slotEventOverlap: false,
  showNonCurrentDates: true,
  eventLimitText: translate('More'),
  header: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },

  slotLabelFormat: 'H:mm',
  allDayHtml: translate('All day'),
  fixedWeekCount: false,
  eventTimeFormat: {
    hour: 'numeric',
    minute: '2-digit',
    meridiem: 'short',
    hour12: false,
    omitZeroMinute: true,
  },
  buttonText: {
    today: translate('Today'),
    dayGridMonth: translate('Month'),
    timeGridWeek: translate('Week'),
    timeGridDay: translate('Day'),
  },
};
