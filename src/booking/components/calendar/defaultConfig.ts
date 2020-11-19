import { translate } from '@waldur/i18n';

export const defaultConfig = {
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
  timeFormat: {
    '': 'H(:mm)( - H:mm)',
  },
  eventTimeFormat: {
    hour: '2-digit',
    day: '2-digit',
    month: '2-digit',
    minute: '2-digit',
    meridiem: 'short',
    hour12: true,
    omitZeroMinute: true,
  },
  buttonText: {
    today: translate('Today'),
    dayGridMonth: translate('Month'),
    timeGridWeek: translate('Week'),
    timeGridDay: translate('Day'),
  },
};
