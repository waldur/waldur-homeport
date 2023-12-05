import type { EventInput, EventApi } from '@fullcalendar/core';
import { padStart, uniqueId } from 'lodash';
import { Duration } from 'luxon';

import { parseDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';

import { BookedItem, BookingProps } from './types';

export interface BookingFilterStateOption {
  value: string;
  label: string;
}

export const getBookingFilterOptionStates = (): BookingFilterStateOption[] => [
  { value: 'Creating', label: translate('Unconfirmed') },
  { value: 'OK', label: translate('Accepted') },
  { value: 'Terminated', label: translate('Rejected') },
];

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
  const count = Math.ceil(dayMinutes / timeStep) + 1;

  return Array.from(new Array(count)).map((_, i) => {
    const allMinutes = i * timeStep;
    const minutes = allMinutes % 60;
    const hour = Math.floor(allMinutes / 60);
    if (hour >= 24 && !include24) {
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
    classNames: 'booking booking-Schedule',
  }));
