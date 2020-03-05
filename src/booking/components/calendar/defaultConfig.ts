// https://fullcalendar.io/docs

import { translate } from '@waldur/i18n';

export const defaultConfig = {
  defaultView: 'dayGridMonth',
  themeSystem: 'bootstrap',
  titleFormat: 'MMMM YYYY',
  slotLabelFormat: 'H:mm',
  allDayHtml: translate('All day'),
  fixedWeekCount: false,
  timeFormat: {
    '': 'H(:mm)( - H:mm)',
  },
  // eventTimeFormat: 'H:mm' ,
  eventTimeFormat: {
    hour: 'numeric',
    minute: '2-digit',
    meridiem: 'short',
    hour12: false,
    omitZeroMinute: true,
  },
  timeZone: 'local',
  firstDay: 1,
  // editable: false,
  // selectable: false,
  // eventResizableFromStart: false,
  eventLimit: true,
  // eventColor: '#1ab394',
  // eventRender,
  eventLimitText: translate('More'),
  buttonText: {
    today: translate('today'),
    dayGridMonth: translate('month'),
    timeGridWeek: translate('week'),
    timeGridDay: translate('day'),
  },
  header: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  showNonCurrentDates: true,
};
