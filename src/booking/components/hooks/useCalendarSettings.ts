import moment from 'moment-timezone';
import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePrevious } from 'react-use';

import { setSettings } from '@waldur/booking/store/actions';
import { getConfig } from '@waldur/booking/store/selectors';

export const useCalendarSettings = () => {
  const config = useSelector(getConfig);
  const dispatch = useDispatch();

  const [weekends, setWeekends] = useState<boolean>(config.weekends);
  const [slotDuration, setSlotDuration] = useState<any>(config.slotDuration);
  const [startTime, setStartTime] = useState<any>(
    config.businessHours.startTime,
  );
  const [endTime, setEndTime] = useState<any>(config.businessHours.endTime);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    config.businessHours.daysOfWeek,
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

  const prevWeekends = usePrevious(weekends);

  const updateWeekends = useCallback(() => {
    if (prevWeekends === weekends) {
      return;
    }
    if (weekends) {
      if (!daysOfWeek.includes(0) || !daysOfWeek.includes(6)) {
        setDaysOfWeek(daysOfWeek.concat([6, 0]));
      }
    } else {
      if (daysOfWeek.includes(0) || daysOfWeek.includes(6)) {
        setDaysOfWeek(daysOfWeek.filter((day) => !(day === 0 || day === 6)));
      }
    }
  }, [weekends, daysOfWeek, setDaysOfWeek, prevWeekends]);

  useEffect(() => {
    updateWeekends();
  }, [updateWeekends, weekends]);

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
