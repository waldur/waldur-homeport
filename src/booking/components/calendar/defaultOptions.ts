import bootstrapPlugin from '@fullcalendar/bootstrap';
import { OptionsInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'; // needed for dayClick
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
  firstDay: 1,
  editable: true,
  selectable: true,
  timeZone: 'local',
  progressiveEventRendering: true,
  lazyFetching: false,
  eventLimit: 6,
  views: {
    agenda: {
      eventLimit: 3,
    },
  },
  allDayMaintainDuration: false,
  forceEventDuration: true,
  defaultTimedEventDuration: '01:00',
  slotEventOverlap: true,
};
