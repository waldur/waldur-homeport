import { EventInput } from '@fullcalendar/core';
import * as moment from 'moment';

import { randomId } from '@waldur/core/fixtures';

import { BookingProps } from './types';

export const createCalendarBookingEvent = ({
  type,
  allDay,
  constraint,
  start,
  end,
  id,
  title,
}: EventInput) => ({
  id: id || randomId(),
  type,
  allDay,
  constraint,
  start,
  end,
  title,
});

export const deleteCalendarBookingEvent = (events, booking) => {
  events.getAll().map((field, index) => {
    if (field.id === booking.id) {
      events.remove(index);
    }
  });
};

export const eventsMapper = events =>
  events.map(event => {
    if (event.type === 'Availability') {
      event.rendering = 'inverse-background';
      event.groupId = 'availableForBooking';
      event.backgroundColor = 'pink';
    } else {
      event.rendering = undefined;
      event.constraint = 'availableForBooking';
    }
    return event;
  });

export const timelineLabels = (interval: number) => {
  const periodsInADay = moment.duration(1, 'day').as('minutes');
  const startClock = moment().startOf('day');
  const timeLabels = [];
  for (let i = 0; i <= periodsInADay; i += interval) {
    startClock.add(i === 0 ? 0 : interval, 'minutes');
    timeLabels.push({
      label: startClock.format('HH:mm'),
      value: startClock.format('HH:mm'),
      hour: startClock.hour(),
      minute: startClock.minute(),
    });
  }
  return timeLabels;
};

type EventMap = (
  events: BookingProps[],
  showAvailability?: undefined | 'background' | 'none',
) => EventInput[];

export const mapBookingEvents: EventMap = (events, showAvailability) =>
  events.map(event => {
    if (event.extendedProps.type === 'Availability') {
      event.rendering = showAvailability;
      event.overlap = true;
      event.classNames = 'fc-event-Availability';
    } else if (event.extendedProps.type === 'Schedule') {
      event.overlap = false;
      event.constraint = ['availability', 'Availability', 'businessHours'];
      event.classNames = 'fc-event-Schedule';
    }
    return event;
  });

export const handleTitle = ({ event, el }) => {
  if (!event.title || event.title === '') {
    return el.querySelector('.fc-title').prepend(event.extendedProps.type);
  }
};

export const handleTime = ({ event, el }) => {
  if (event.allDay) {
    const content = el.querySelector('.fc-content');
    return (content.innerHTML =
      '<i class="fa fa-clock-o"> All-day </i>' + content.innerHTML);
  }
};
