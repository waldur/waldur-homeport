import { EventInput, EventApi } from '@fullcalendar/core';
import * as moment from 'moment';

import { randomId } from '@waldur/core/fixtures';

import { BookingProps, ConfigProps } from './types';

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
    if (
      event.extendedProps.type === 'Availability' ||
      event.type === 'availability'
    ) {
      event.rendering = showAvailability;
      event.overlap = true;
      event.classNames = 'booking booking-Availability';
    } else {
      event.overlap = false;
      event.constraint = ['availability', 'Availability', 'businessHours'];
      event.classNames = 'booking booking-Schedule';
    }
    return event;
  });

export const transformBookingEvent = (event, showAvailability = false) => {
  if (event.extendedProps.type === 'Availability') {
    event.rendering = showAvailability ? undefined : 'background';
    event.classNames = showAvailability ? 'booking booking-Availability' : '';
    event.background = 'green';
    event.overlap = true;
    //event.groupId = 'businessHours';
  } else if (event.extendedProps.type === 'Schedule') {
    event.overlap = false;
    event.constraint = 'businessHours';
    event.classNames = 'booking booking-Schedule';
    event.background = 'blue';
  }
  return event;
};

export const handleTitle = ({ event, el }) => {
  if (!event.title) {
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

export const createBooking = ({
  id,
  start,
  end,
  allDay,
  title = '',
  extendedProps,
}: EventApi | EventInput | BookingProps): BookingProps => ({
  id,
  start,
  end,
  allDay,
  title,
  extendedProps,
});

export const handleSelect = (arg, calendarType): BookingProps => {
  const type = calendarType === 'create' ? 'Availability' : 'Schedule';
  const id = `${randomId()}-${arg.jsEvent.timeStamp}`;

  return createBooking({ ...arg, id, extendedProps: { type } });
};

interface Updater {
  event: BookingProps | EventInput | EventApi;
  oldEvent?: BookingProps | EventApi;
  prevEvent?: EventApi;
}

export const handleEventUpdate = ({ event, oldEvent, prevEvent }: Updater) => {
  const oldID: BookingProps['id'] =
    (prevEvent && prevEvent.id) || (oldEvent && oldEvent.id);
  return { oldID, event };
};

export function keysOf<T>(o: T) {
  return Object.keys(o) as (keyof T)[];
}

export function filterObject<T>(
  option: T,
  predicate: (propName: keyof T) => boolean,
) {
  return keysOf(option).reduce((acc, propName) => {
    if (predicate(propName)) {
      acc[propName] = option[propName];
    }
    return acc;
  }, {} as Partial<T>);
}

export const createTimeSlots = (
  { startStr, endStr, start, end },
  config: ConfigProps,
  event,
) => {
  const startT = moment(
    `${startStr} ${config.businessHours.startTime}`,
    'YYYY-MM-DD HH:mm',
  );
  const endT = moment(
    `${endStr} ${config.businessHours.endTime}`,
    'YYYY-MM-DD HH:mm',
  ).subtract(1, 'day');
  const timeSlots = [];
  const mStart = moment(start);
  const mEnd = moment(end);

  if (!mStart.isSame(mEnd, 'day')) {
    while (startT < endT) {
      timeSlots.push({
        start: startT.clone().format(),
        end: moment(
          startT.clone().format('YYYY-MM-DD ') + config.businessHours.endTime,
        ).format(),
        id: event.id,
        title: event.title,
        extendedProps: {
          type: event.extendedProps.type,
          config,
        },
      });
      startT.add(moment.duration(1, 'day'));
    }
  }
  return timeSlots;
};
