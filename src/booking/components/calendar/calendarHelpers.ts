import { EventApi, EventInput } from '@fullcalendar/core';

import { BookingProps } from '@waldur/booking/types';
import { randomId } from '@waldur/core/fixtures';

export const handleSelect = (
  arg,
  type: 'Availability' | 'Schedule',
): BookingProps => {
  const { allDay, startStr, start, endStr, end } = arg;
  const event = {
    start: allDay ? startStr : start,
    end: allDay ? endStr : end,
    allDay,
    id: `${randomId()}-${arg.jsEvent.timeStamp}`,
    title: '',
    extendedProps: { type },
  };
  return event;
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
