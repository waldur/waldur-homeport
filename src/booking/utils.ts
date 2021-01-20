import type { EventInput, EventApi } from '@fullcalendar/core';
import uniqueId from 'lodash.uniqueid';
import moment from 'moment';

import {
  BOOKING_RESOURCES_TABLE,
  CURSOR_NOT_ALLOWED_CLASSNAME,
} from '@waldur/booking/constants';
import { orderByFilter } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { fetchListStart } from '@waldur/table/actions';

import { BookedItem, BookingProps } from './types';

export const createCalendarBookingEvent = ({
  type,
  allDay,
  constraint,
  start,
  end,
  id,
  title,
}: EventInput) => ({
  id: id || uniqueId('booking'),
  type,
  allDay,
  constraint,
  start,
  end,
  title,
});

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

interface Updater {
  event: BookingProps | EventInput | EventApi | any;
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

const getNextSlot = (slots, selectedValue) =>
  slots
    .map((slot) => moment(slot.start))
    .sort((a, b) => a.valueOf() - b.valueOf())
    .find((next) => next.isAfter(moment(selectedValue)));

const getSlotEnd = (slots, selectedValue) =>
  slots
    .map((slot) => moment(slot.end))
    .sort((a, b) => a.valueOf() - b.valueOf())
    .find((next) => moment(selectedValue).isSameOrBefore(next));

export const handleSchedule = (
  { start, end, view, jsEvent },
  availabilitySlotsList,
  slotDuration?,
) => {
  const diff = moment(end).diff(moment(start));
  const { hours, minutes } = moment(slotDuration, 'HH:mm:ss').toObject();
  const setDuration = moment.duration({ hours, minutes });

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
      eventData.start = getNextSlot(availabilitySlotsList, start).format();
      eventData.end = getSlotEnd(
        availabilitySlotsList,
        moment(end).subtract(1, 'd'),
      ).format();
    } else {
      const nextStart = getNextSlot(availabilitySlotsList, start);
      eventData.start = nextStart.format();
      eventData.end = nextStart.clone().add(setDuration).format();
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

const getHoursMinutes = (date, unit = 'HH:mm') => {
  const { hours, minutes } = moment(date, unit).toObject();
  return { hours, minutes };
};

export const createAvailabilityDates = (event: BookingProps) => {
  const dates: EventInput[] = [];

  const mStart = moment(event.start);
  const mEnd = moment(event.end);
  const { config } = event.extendedProps;

  while (mStart.diff(mEnd, 'd')) {
    const curDay =
      mStart.isoWeekday() === 7 ? mStart.isoWeekday() - 1 : mStart.isoWeekday();
    const event: BookingProps = {
      start: mStart
        .clone()
        .set(getHoursMinutes(config.businessHours.startTime))
        .format(),
      end: mEnd
        .clone()
        .set(getHoursMinutes(config.businessHours.endTime))
        .format(),
      allDay: true,
      extendedProps: {
        type: 'Availability',
        config,
      },
    };

    if (config.businessHours.daysOfWeek.includes(curDay)) {
      dates.push(event);
    }

    mStart.add(1, 'd');
  }
  return dates;
};

export const createAvailabilitySlots = (availabilitiDates, slotDuration) => {
  const slots = [];

  availabilitiDates.map((availabilitiDayEvent) => {
    const currentDate = moment(availabilitiDayEvent.start);

    while (currentDate < moment(availabilitiDayEvent.end)) {
      const slot: EventInput = {
        start: currentDate.format(),
        end: currentDate.add(slotDuration).format(),
        id: 'availableForBooking',
        groupId: 'availableForBooking',
        editable: false,
        rendering: 'background',
      };
      slots.push(slot);
    }
  });

  return slots;
};

export const bookingMapper = (events, showAvailability = false) =>
  events.map((event) => {
    if (event.extendedProps && event.extendedProps.type === 'Availability') {
      event.rendering = showAvailability ? undefined : 'background';
      event.classNames = showAvailability ? 'booking booking-Availability' : '';
      event.overlap = true;
      event.groupId = 'Availability';
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
  });

export const handleWeekDays = (weekdayNumbers, dayNumber): number[] => {
  const intVal = parseInt(dayNumber);
  if (weekdayNumbers.includes(intVal)) {
    return weekdayNumbers.filter((item) => item !== intVal);
  } else {
    return weekdayNumbers.concat(intVal);
  }
};

export const getDurationOptions = (
  locale: string,
  minuteArray: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 24],
  units = 'hours',
) => {
  moment.locale(locale);
  return minuteArray.map((timeUnit) => {
    return {
      value: moment
        .utc(moment.duration({ [units]: timeUnit }).asMilliseconds())
        .format('HH:mm:ss'),
      label: moment.duration({ [units]: timeUnit }).humanize(),
    };
  });
};

export const updateBookingsList = (
  filterState,
  offering_uuid,
  provider_uuid,
  sorting,
) =>
  fetchListStart(BOOKING_RESOURCES_TABLE, {
    offering_type: 'Marketplace.Booking',
    o: orderByFilter(sorting),
    state: filterState.map(({ value }) => value),
    offering_uuid,
    provider_uuid,
  });

export const getBookedSlots = (bookedItems: BookedItem[]) =>
  bookedItems.map((item) => ({
    id: uniqueId('booking'),
    start: item.start,
    end: item.end,
    allDay: false,
    title: translate('Reserved slot'),
    extendedProps: {
      type: 'Schedule',
    },
    backgroundColor: '#333',
    borderColor: '#333',
    textColor: '#c6c7cb',
    className: CURSOR_NOT_ALLOWED_CLASSNAME,
    classNames: 'booking booking-Schedule',
  }));
