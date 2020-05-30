import bootstrapPlugin from '@fullcalendar/bootstrap';
import { OptionsInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import momentPlugin from '@fullcalendar/moment';
import momentTimezonePlugin from '@fullcalendar/moment-timezone';
import timeGridPlugin from '@fullcalendar/timegrid';

import { translate } from '@waldur/i18n';

export const defaultOptions: OptionsInput = {
  plugins: [
    dayGridPlugin,
    timeGridPlugin,
    interactionPlugin,
    bootstrapPlugin,
    momentTimezonePlugin,
    momentPlugin,
    listPlugin,
  ],
  themeSystem: 'bootstrap',
  handleWindowResize: true,
  buttonText: {
    today: translate('today'),
    month: translate('month'),
    week: translate('week'),
    day: translate('day'),
  },
  header: {
    left: 'prev,today,next',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  eventTimeFormat: {
    hour: 'numeric',
    minute: '2-digit',
    meridiem: 'short',
    hour12: false,
    omitZeroMinute: true,
  },
  firstDay: 1,
  timeZone: 'local',
  progressiveEventRendering: true,
  lazyFetching: false,
  eventLimit: 6,
  views: {
    agenda: {
      eventLimit: 3,
    },
  },
  fixedWeekCount: false,
  slotEventOverlap: false,
};
