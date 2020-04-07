import { Calendar, OptionsInput } from '@fullcalendar/core';
import * as React from 'react';
import { useSelector } from 'react-redux';

import { defaultOptions } from './defaultOptions';

export const dateOnly = (dateInLocal: Date) =>
  new Date(
    dateInLocal.getFullYear(),
    dateInLocal.getMonth(),
    dateInLocal.getDate(),
  );
export const dateOnlyUTC = (dateInUtc: Date) =>
  new Date(
    dateInUtc.getUTCFullYear(),
    dateInUtc.getUTCMonth(),
    dateInUtc.getUTCDate(),
  );
export const getCalendarState = state => state.bookings;

export interface FullCalendarRefHandles {
  getApi: () => Calendar;
}

export default React.forwardRef((props: OptionsInput) => {
  const elRef = React.useRef<HTMLDivElement>(null);
  const calendarRef = React.useRef<Calendar>();
  const oldDate = React.useRef<Date>();
  const calendarState = useSelector(getCalendarState);

  const getNewDate = () => {
    const calApi = calendarRef.current!;
    const datetime = calApi.dateEnv.createMarker(
      props.defaultDate ? props.defaultDate : calApi.getNow(),
    );
    const utc = dateOnlyUTC(datetime);
    return utc;
  };
  // calendar did mount
  React.useEffect(() => {
    const cal = new Calendar(elRef.current!, {
      ...defaultOptions,
      ...calendarState.config,
      ...props,
    });
    calendarRef.current = cal;
    cal.render();
    oldDate.current = getNewDate();

    return () => cal.destroy();
  }, []);

  return <div ref={elRef} />;
});
