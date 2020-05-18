import { EventInput, EventApi } from '@fullcalendar/core';
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
  id: id || `${randomId()}-${timeStamp!}`,
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
    //event.overlap = true;
  } else if (
    event.extendedProps &&
    event.extendedProps.type === 'availableForBooking'
  ) {
    event.groupId = 'availableForBooking';
    event.rendering = 'background';
    event.overlap = true;
    event.allDay = false;
  } else {
    //event.overlap = false;
    event.constraint = 'availableForBooking';
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
    .map(slot => moment(slot.start))
    .sort(time => time.valueOf())
    .find(next => next.isAfter(moment(selectedValue)));

export const handleSchedule = (arg, availabilitySlotsList, slotDuration?) => {
  const diff = moment(arg.end).diff(moment(arg.start));
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
    arg.jsEvent.timeStamp,
  );

  if (arg.view.type === 'dayGridMonth') {
    if (diff > 86400000 /* one day in milliseconds */) {
      eventData.start = getNextSlot(availabilitySlotsList, arg.start).format();
      eventData.end = getNextSlot(
        availabilitySlotsList,
        moment(arg.end).subtract(1, 'd'),
      ).format();
    } else {
      const nextStart = getNextSlot(availabilitySlotsList, arg.start);
      eventData.start = nextStart.format();
      eventData.end = nextStart.clone().add(setDuration).format;
    }

    return eventData;
  } else {
    return {
      ...eventData,
      start: arg.start,
      end: arg.end,
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
  const { slotDuration, businessHours, weekends } = event.extendedProps.config;

  while (mStart.diff(mEnd, 'd')) {
    const curDay =
      mStart.isoWeekday() === 7 ? mStart.isoWeekday() - 1 : mStart.isoWeekday();
    const event: BookingProps = {
      start: mStart
        .clone()
        .set(getHoursMinutes(businessHours.startTime))
        .format(),
      end: mStart
        .clone()
        .set(getHoursMinutes(businessHours.endTime))
        .format(),
      allDay: true,
      rendering: 'background',
      extendedProps: {
        type: 'Availability',
        config: {
          slotDuration,
          businessHours,
          weekends,
        },
      },
    };

    if (businessHours.daysOfWeek.includes(curDay)) {
      dates.push(event);
    }

    mStart.add(1, 'd');
  }
  return dates;
};

export const createAvailabilitySlots = (
  availabilitiDates,
  slotDurationMinutes,
) => {
  const slots = [];

  availabilitiDates.map(availabilitiDayEvent => {
    const currentDate = moment(availabilitiDayEvent.start);

    while (currentDate < moment(availabilitiDayEvent.end)) {
      const slot = {
        start: currentDate.format(),
        end: currentDate.add(slotDurationMinutes).format(),
      };
      slots.push(slot);
    }
  });

  return slots;
};
