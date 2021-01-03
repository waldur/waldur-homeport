import { FunctionComponent } from 'react';

import { BusinessHoursGroup } from './BusinessHoursGroup';
import { useCalendarSettings } from './hooks/useCalendarSettings';
import { SlotDurationGroup } from './SlotDurationGroup';
import { TimeZoneGroup } from './TimeZoneGroup';
import { WeekdaysGroup } from './WeekdaysGroup';
import { WeekendsGroup } from './WeekendsGroup';

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
