import { EventInput } from '@fullcalendar/core';
import { DateTime } from 'luxon';

import { parseDate } from '@waldur/core/dateUtils';

const isWeekend = (day: DateTime): boolean => [6, 7].includes(day.weekday);

const isMonday = (day: DateTime): boolean => day.weekday === 1;

const isFriday = (day: DateTime): boolean => day.weekday === 5;

export const removeWeekends = (eventToSplit: EventInput) => {
  const events = [];
  const start = parseDate(eventToSplit.start);
  const end = parseDate(eventToSplit.end);
  const weekCount = end.diff(start).as('weeks');
  let cursor = start;

  for (let i = 0; i <= weekCount; i++) {
    let tempStart = null;
    let tempEnd = null;

    while (cursor.diff(end).as('days')) {
      const currentDate = cursor;
      if (!isWeekend(currentDate)) {
        if (currentDate.ordinal === start.ordinal || isMonday(currentDate)) {
          tempStart = currentDate;
        }
        const nextDay = currentDate.plus({ days: 1 });
        if (nextDay.ordinal === end.ordinal || isFriday(currentDate)) {
          tempEnd = nextDay;
        }
      }

      if (tempStart && tempEnd) {
        cursor = tempEnd;
        break;
      } else {
        cursor = cursor.plus({ days: 1 });
      }
    }

    events.push({
      ...eventToSplit,
      id: eventToSplit.id + '.' + i,
      start: tempStart?.toJSDate(),
      end: tempEnd?.toJSDate(),
    });
  }
  return events;
};
