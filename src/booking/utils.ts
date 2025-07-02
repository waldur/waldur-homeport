import { padStart, uniqueId } from 'lodash-es';
import { DateTime, Duration } from 'luxon';

import { parseDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Option } from '@waldur/marketplace/common/registry';

import { BookedItem, BookingProps, EventInput } from './types';

export const getBookingFilterOptionStates = (): Option[] => [
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
  }: EventInput | BookingProps,
  timeStamp?: string,
): BookingProps => ({
  id: id || `${uniqueId('booking')}-${timeStamp!}`,
  start,
  end,
  allDay,
  title,
  extendedProps,
});

interface RangeItem {
  start: DateTime;
  end: DateTime;
}

const subtractRanges = (
  availableRanges: RangeItem[],
  busyRanges: RangeItem[],
) => {
  const result: RangeItem[] = [];

  for (const available of availableRanges) {
    let current = [available];

    for (const busy of busyRanges) {
      const temp: typeof current = [];

      for (const range of current) {
        if (
          busy.end.toMillis() <= range.start.toMillis() ||
          busy.start.toMillis() >= range.end.toMillis()
        ) {
          temp.push(range); // no overlap
        } else {
          if (busy.start.toMillis() > range.start.toMillis()) {
            temp.push({ start: range.start, end: busy.start });
          }
          if (busy.end.toMillis() < range.end.toMillis()) {
            temp.push({ start: busy.end, end: range.end });
          }
        }
      }

      current = temp;
    }

    result.push(...current);
  }

  return result;
};

const mergeEventsIntoRanges = (events: BookingProps[]) => {
  const sorted = events
    .map((e) => ({
      start: parseDate(e.start),
      end: parseDate(e.end),
    }))
    .sort((a, b) => a.start.toMillis() - b.start.toMillis());

  const merged: RangeItem[] = [];

  for (const ev of sorted) {
    const last = merged[merged.length - 1];
    if (last && ev.start.toMillis() <= last.end.toMillis()) {
      last.end = DateTime.max(last.end, ev.end);
    } else {
      merged.push({ start: ev.start, end: ev.end });
    }
  }

  return merged;
};

export const getAvailableRangeOfDates = (
  schedules: BookingProps[],
  inUseRanges: any[],
) => {
  const busyRanges = inUseRanges.map((r) => ({
    start: parseDate(r.start),
    end: parseDate(r.end),
  }));

  const fullRanges = mergeEventsIntoRanges(schedules);
  const availableRanges = subtractRanges(fullRanges, busyRanges);

  return availableRanges.map((range) => {
    let start = range.start;
    // if start time is 23:59, take it to the next day to render it currently in flatpickr
    if (start.hour === 23 && start.minute === 59) {
      start = start.plus({ hours: 1 }).startOf('day');
    }
    return {
      from: start.toISO(),
      to: range.end.toISO(),
    };
  });
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

  return Array.from({ length: count }).map((_, i) => {
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
