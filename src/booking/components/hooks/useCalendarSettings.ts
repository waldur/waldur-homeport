import moment from 'moment-timezone';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setSettings } from '../../store/actions';
import { ConfigProps } from '../../types';

const getSettings = (state) => state.bookings.config;

export const useCalendarSettings = () => {
  const curState: ConfigProps = useSelector(getSettings);
  const dispatch = useDispatch();

  const [weekends, setWeekends] = useState<boolean>(curState.weekends);
  const [slotDuration, setSlotDuration] = useState<any>(curState.slotDuration);
  const [startTime, setStartTime] = useState<any>(
    curState.businessHours.startTime,
  );
  const [endTime, setEndTime] = useState<any>(curState.businessHours.endTime);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    curState.businessHours.daysOfWeek,
  );
  const [timeZone, setTimeZone] = useState<any>(moment.tz.guess());

  useEffect(() => {
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
