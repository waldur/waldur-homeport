import { translate } from '@waldur/i18n';

export const defaultConfig = {
  defaultView: 'dayGridMonth',
  themeSystem: 'bootstrap',
  height: 'auto',
  titleFormat: 'MMMM YYYY',
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
