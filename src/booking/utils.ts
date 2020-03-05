import { EventInput } from '@fullcalendar/core';
import {EventApi} from '@fullcalendar/core/api/EventApi';

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

interface EventHandlers {
  event: EventInput | EventApi;
  oldEvent?: EventInput | EventApi;
  prevEvent?: EventInput | EventApi;
}

export const calendarEventPayloadCreator = ({event, oldEvent, prevEvent}: EventHandlers, eventList?) => {
  const {start, end, id, extendedProps, title, allDay} = event;
  const payload = {
    event: {id, start, end, allDay, title, extendedProps},
    oldId: event.id,
    formID: null,
  };
  if (oldEvent || prevEvent) {
    payload.oldId = (oldEvent || prevEvent).id;
  }
  if ( eventList ) {
    payload.formID = eventList.findIndex(item => item.id === payload.oldId);
  }
  return payload;
};
