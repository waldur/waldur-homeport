import bootstrapPlugin from '@fullcalendar/bootstrap';
import { OptionsInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import momentPlugin from '@fullcalendar/moment';
import momentTimezonePlugin from '@fullcalendar/moment-timezone';
import timeGridPlugin from '@fullcalendar/timegrid';

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
  height: 'auto',
  themeSystem: 'bootstrap',
  handleWindowResize: true,
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
  slotLabelFormat: {
    hour: 'numeric',
    minute: '2-digit',
    omitZeroMinute: true,
    meridiem: 'short',
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
  slotEventOverlap: false,
};
