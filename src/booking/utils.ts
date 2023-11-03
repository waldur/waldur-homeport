import type { EventInput, EventApi } from '@fullcalendar/core';
import { padStart, uniqueId } from 'lodash';
import { DateTime, Duration } from 'luxon';

import { CURSOR_NOT_ALLOWED_CLASSNAME } from '@waldur/booking/constants';
import { parseDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';

import { BookedItem, BookingProps } from './types';

export interface AvailabilitySlot {
  start: Date | string;
  end: Date | string;
}

export const deleteCalendarBooking = (events, booking) => {
  let removedEvent = null;
  events.getAll().map((field, index) => {
    if (field.id === booking.id) {
      removedEvent = events.get(index);
      events.remove(index);
    }
  });
  return removedEvent;
};

export const eventsMapper = (events) =>
  events.map((event) => {
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
  const periodsInADay = Duration.fromObject({ days: 1 }).as('minutes');
  let startClock = DateTime.now().startOf('day');
  const timeLabels = [];
  for (let i = 0; i <= periodsInADay; i += interval) {
    startClock = startClock.plus({ minutes: i === 0 ? 0 : interval });
    timeLabels.push({
      label: startClock.toFormat('T'),
      value: startClock.toFormat('T'),
      hour: startClock.hour,
      minute: startClock.minute,
    });
  }
  return timeLabels;
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

export const createBooking = (
  {
    id,
    start,
    end,
    allDay,
    title = '',
    extendedProps,
  }: EventApi | EventInput | BookingProps,
  timeStamp?: string,
): BookingProps => ({
  id: id || `${uniqueId('booking')}-${timeStamp!}`,
  start,
  end,
  allDay,
  title,
  extendedProps,
});

export const transformBookingEvent = (event, showAvailability = false) => {
  if (event === undefined) {
    return false;
  }

  if (event.extendedProps && event.extendedProps.type === 'Availability') {
    event.rendering = showAvailability ? undefined : 'background';
    event.classNames = showAvailability ? 'booking booking-Availability' : '';
    event.overlap = true;
    if (!showAvailability) {
      event.groupId = 'Availability';
    }
  } else if (
    (event.extendedProps &&
      event.extendedProps.type === 'availableForBooking') ||
    event.id === 'availableForBooking'
  ) {
    event.groupId = 'availableForBooking';
    event.rendering = 'background';
    event.overlap = true;
    event.allDay = false;
  } else {
    event.classNames = event.state!
      ? 'booking booking-' + event.state
      : 'booking booking-Schedule';
  }

  return event;
};

export const eventRender = (arg, focused?) => {
  if (arg.el && arg.el.classList.contains('fc-event')) {
    if (focused === arg.event.id) {
      arg.el.classList.add('isHovered');
    }
    if (arg.view.type === 'dayGridMonth') {
      handleTime(arg);
      handleTitle(arg);
    }
    return arg.el;
  }
};

const getNextSlot = (slots: AvailabilitySlot[], selectedValue) =>
  slots
    .map((slot) => parseDate(slot.start))
    .sort((a, b) => a.valueOf() - b.valueOf())
    .find((next) => next > parseDate(selectedValue));

const getSlotEnd = (slots: AvailabilitySlot[], selectedValue) =>
  slots
    .map((slot) => parseDate(slot.end))
    .sort((a, b) => a.valueOf() - b.valueOf())
    .find((next) => parseDate(selectedValue) <= next);

export const handleSchedule = (
  { start, end, view, jsEvent },
  availabilitySlotsList: AvailabilitySlot[],
  slotDuration?,
) => {
  const diff = parseDate(end).diff(parseDate(start)).as('milliseconds');

  const eventData = createBooking(
    {
      start: '',
      end: '',
      allDay: false,
      extendedProps: {
        type: 'Schedule',
      },
    },
    jsEvent.timeStamp,
  );

  if (view.type === 'dayGridMonth') {
    if (diff > 86400000 /* one day in milliseconds */) {
      eventData.start = getNextSlot(availabilitySlotsList, start).toISO();
      eventData.end = getSlotEnd(
        availabilitySlotsList,
        parseDate(end).minus({ days: 1 }),
      ).toISO();
    } else {
      const nextStart = getNextSlot(availabilitySlotsList, start);
      eventData.start = nextStart.toISO();
      eventData.end = nextStart
        .plus(Duration.fromISOTime(slotDuration, {}))
        .toISO();
    }

    return eventData;
  } else {
    return {
      ...eventData,
      start: start,
      end: end,
    };
  }
};

export const createAvailabilityDates = (event: BookingProps) => {
  const dates: EventInput[] = [];

  let start = parseDate(event.start);
  const end = parseDate(event.end);
  const { config } = event.extendedProps;

  while (start.diff(end).as('days')) {
    const curDay = start.weekday === 7 ? start.weekday - 1 : start.weekday;
    const startTime = Duration.fromISOTime(config.businessHours.startTime, {});
    const endTime = Duration.fromISOTime(config.businessHours.endTime, {});
    const event: BookingProps = {
      start: start
        .set({ hour: startTime.hours, minute: startTime.minutes })
        .toISO(),
      end: end.set({ hour: endTime.hours, minute: endTime.minutes }).toISO(),
      allDay: true,
      extendedProps: {
        type: 'Availability',
        config,
      },
    };

    if (config.businessHours.daysOfWeek.includes(curDay)) {
      dates.push(event);
    }

    start = start.plus({ days: 1 });
  }
  return dates;
};

export const createAvailabilitySlots = (
  events: BookingProps[],
  slotDuration: Duration,
): EventInput[] => {
  const slots = [];

  events.forEach((event) => {
    const eventEnd = parseDate(event.end);
    let cursor = parseDate(event.start);

    while (cursor < eventEnd) {
      const end = cursor.plus(slotDuration);
      // Don't push duplicate slots
      if (!slots.some((sl) => parseDate(sl.start).equals(cursor))) {
        const slot: EventInput = {
          start: cursor.toISO(),
          end: end.toISO(),
          id: 'availableForBooking',
          groupId: 'availableForBooking',
          editable: false,
          rendering: 'background',
        };
        slots.push(slot);
      }
      cursor = end;
    }
  });

  return slots;
};

export const handleWeekDays = (weekdayNumbers, dayNumber): number[] => {
  const intVal = parseInt(dayNumber);
  if (weekdayNumbers.includes(intVal)) {
    return weekdayNumbers.filter((item) => item !== intVal);
  } else {
    return weekdayNumbers.concat(intVal);
  }
};

export const getDurationOptions = () =>
  [1, 2, 3, 4, 5, 6, 7, 8, 24].map((hours) => ({
    value: Duration.fromObject({ hours }).toFormat('hh:mm:ss'),
    label: `${hours} hours`,
  }));

const pad2 = (value: string | number) => padStart(String(value), 2, '0');

export const getTimeOptions = (
  timeStep = 30,
  include24 = false,
): Array<{ h; m }> => {
  const dayMinutes = 60 * 24;
  const count = dayMinutes / timeStep + 1;

  return Array.from(new Array(count)).map((_, i) => {
    const allMinutes = i * timeStep;
    const minutes = allMinutes % 60;
    const hour = Math.floor(allMinutes / 60);
    if (hour === 24 && !include24) {
      return { h: '23', m: '59' };
    }
    return {
      h: pad2(hour),
      m: pad2(minutes),
    };
  });
};

export const getBookedSlots = (bookedItems: BookedItem[]) =>
  bookedItems.map((item) => ({
    id: uniqueId('booking'),
    start: item.start,
    end: item.end,
    allDay: false,
    title: item.created_by_full_name
      ? translate('Reserved slot by {name}', {
          name: item.created_by_full_name,
        })
      : translate('Reserved slot'),
    extendedProps: {
      type: 'Schedule',
    },
    backgroundColor: '#333',
    borderColor: '#333',
    textColor: '#c6c7cb',
    className: CURSOR_NOT_ALLOWED_CLASSNAME,
    classNames: 'booking booking-Schedule',
  }));
