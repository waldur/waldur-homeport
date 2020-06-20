import * as moment from 'moment-timezone';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setSettings } from '../../store/actions';
import { ConfigProps } from '../../types';

const getSettings = (state) => state.bookings.config;

export const useCalendarSettings = () => {
  const curState: ConfigProps = useSelector(getSettings);
  const dispatch = useDispatch();

  const [weekends, setWeekends] = React.useState<boolean>(curState.weekends);
  const [slotDuration, setSlotDuration] = React.useState<any>(
    curState.slotDuration,
  );
  const [startTime, setStartTime] = React.useState<any>(
    curState.businessHours.startTime,
  );
  const [endTime, setEndTime] = React.useState<any>(
    curState.businessHours.endTime,
  );
  const [daysOfWeek, setDaysOfWeek] = React.useState<number[]>(
    curState.businessHours.daysOfWeek,
  );
  const [timeZone, setTimeZone] = React.useState<any>(moment.tz.guess());

  React.useEffect(() => {
    dispatch(
      setSettings({
        weekends,
        slotDuration,
        businessHours: {
          startTime,
          endTime,
          daysOfWeek,
        },
      }),
    );
  }, [
    weekends,
    startTime,
    endTime,
    daysOfWeek,
    slotDuration,
    timeZone,
    dispatch,
  ]);

  return {
    weekends,
    setWeekends,
    daysOfWeek,
    setDaysOfWeek,
    slotDuration,
    setSlotDuration,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    timeZone,
    setTimeZone,
  };
};
