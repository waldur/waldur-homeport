import { EventInput } from '@fullcalendar/core';
import * as moment from 'moment';

import { randomId } from '@waldur/core/fixtures';

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
    if (event.type === 'availability') {
      event.rendering = 'inverse-background';
      event.groupId = 'availableForBooking';
      event.backgroundColor = 'pink';
    } else {
      event.rendering = undefined;
      event.constraint = 'availableForBooking';
    }
    return event;
  });

interface DayRender {
  date: Date;
  el: HTMLElement;
  allDay?: boolean;
}

export const availabilityCellRender = (
  events: EventInput[],
  dayRender: DayRender,
) => {
  events.map(event => {
    const currentDate = Date.parse(dayRender.date.toString());
    const isStart = Date.parse(event.start as string) === currentDate;
    const isBetween =
      Date.parse(event.start as string) < currentDate &&
      currentDate < Date.parse(event.end as string);
    if (event.type === 'availability' && (isStart || isBetween)) {
      dayRender.el.style.backgroundColor = 'rgba(0,250,0,.2)';
    }
  });
};

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
