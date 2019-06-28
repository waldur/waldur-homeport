import { EventInput } from '@fullcalendar/core';

import { randomId } from '@waldur/core/fixtures';

export const createCalendarBookingEvent = ({
  type, allDay, constraint, start, end, id,
}: EventInput) => ({
  id: id || randomId(),
  type, allDay, constraint, start, end,
});

export const eventsMapper = events => events.map(event => {
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
