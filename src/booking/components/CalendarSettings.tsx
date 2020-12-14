import { useCallback, useEffect, useRef, FunctionComponent } from 'react';

import { BusinessHoursGroup } from './BusinessHoursGroup';
import { useCalendarSettings } from './hooks/useCalendarSettings';
import { SlotDurationGroup } from './SlotDurationGroup';
import { TimeZoneGroup } from './TimeZoneGroup';
import { WeekdaysGroup } from './WeekdaysGroup';
import { WeekendsGroup } from './WeekendsGroup';

const usePreviousWeekendsValue = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export const CalendarSettings: FunctionComponent = () => {
  const {
    weekends,
    daysOfWeek,
    slotDuration,
    startTime,
    endTime,
    timeZone,
    setWeekends,
    setDaysOfWeek,
    setSlotDuration,
    setStartTime,
    setEndTime,
    setTimeZone,
  } = useCalendarSettings();

  const prevWeekends = usePreviousWeekendsValue(weekends);

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

  return (
    <>
      <BusinessHoursGroup
        startTime={startTime}
        endTime={endTime}
        setStartTime={setStartTime}
        setEndTime={setEndTime}
      />
      <WeekdaysGroup daysOfWeek={daysOfWeek} setDaysOfWeek={setDaysOfWeek} />
      <WeekendsGroup weekends={weekends} setWeekends={setWeekends} />
      <SlotDurationGroup
        slotDuration={slotDuration}
        setSlotDuration={setSlotDuration}
      />
      <TimeZoneGroup timeZone={timeZone} setTimeZone={setTimeZone} />
    </>
  );
};
