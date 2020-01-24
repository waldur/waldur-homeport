// https://fullcalendar.io/docs

import {translate} from '@waldur/i18n';

import { eventRender } from '../utils';

export const defaultConfig = {
  defaultView: 'dayGridMonth',
  themeSystem: 'bootstrap',
  titleFormat: 'MMMM YYYY',
  timeZone: 'UTC',
  firstDay: 1,
  editable: false,
  selectable: false,
  eventResizableFromStart: false,
  eventLimit: true,
  eventColor: '#1ab394',
  eventRender,
  eventLimitText: translate('More'),
  header: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
};
