import * as moment from 'moment-timezone';
import * as React from 'react';
import Select from 'react-select';

import { Tooltip } from '@waldur/core/Tooltip';
import { getOptions } from '@waldur/form-react/TimeSelectField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { useCalendarSettings } from '../hooks/useCalendarSettings';

const timeZoneArray = moment.tz
  .names()
  .map(zone => ({ value: zone, label: zone }));
const daysArray = [1, 2, 3, 4, 5, 6, 0];
const timeMinutes = [30, 60, 120, 180, 240, 300, 360, 420, 480, 1440];

const getDayLabel = (day: number): string => moment.weekdays(day);

const handleWeekDays = (weekdayNumbers, dayNumber): number[] => {
  const intVal = parseInt(dayNumber, null);
  if (weekdayNumbers.includes(intVal)) {
    return weekdayNumbers.filter(item => item !== intVal);
  } else {
    return weekdayNumbers.concat(intVal);
  }
};

export const getDurationOptions = (minuteArray: number[], units = 'minutes') =>
  minuteArray.map(timeUnit => ({
    value: moment
      .utc(moment.duration({ [units]: timeUnit }).asMilliseconds())
      .format('HH:mm'),
    label: moment.duration({ [units]: timeUnit }).humanize(),
  }));

export const CalendarSettings: React.FC = () => {
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
      <FormGroup
        label={translate('Business hours')}
        labelClassName="control-label col-sm-3"
        valueClassName="col-sm-8"
        description={translate('Daily available booking time range')}
      >
        <label
          className="col-xs-2 control-label"
          htmlFor="react-select-startTime--value"
        >
          <i className="fa fa-clock-o" />
        </label>
        <Select
          instanceId="startTime"
          className="col-xs-4"
          name="startTime"
          simpleValue={true}
          searchable={false}
          clearable={false}
          multi={false}
          options={getOptions(30)}
          value={startTime}
          onChange={setStartTime}
        />
        <label
          className="col-xs-2 control-label"
          htmlFor="react-select-endTime--value"
        >
          {translate('till')}
        </label>
        <Select
          instanceId="endTime"
          name="endTime"
          className="col-xs-4"
          simpleValue={true}
          searchable={false}
          clearable={false}
          multi={false}
          options={getOptions(30)}
          value={endTime}
          onChange={setEndTime}
        />
      </FormGroup>

      <FormGroup
        label={translate('Select available weekdays')}
        labelClassName="control-label col-sm-3"
        valueClassName={'col-sm-8'}
      >
        <div className="weekDays-selector">
          {daysArray.map((day, index) => (
            <Tooltip key={index} label={getDayLabel(day)} id={`weekday-${day}`}>
              <input
                type="checkbox"
                id={`weekday-${day}`}
                className="weekday"
                value={day}
                checked={daysOfWeek.includes(day)}
                onChange={e =>
                  setDaysOfWeek(handleWeekDays(daysOfWeek, e.target.value))
                }
              />
              <label htmlFor={`weekday-${day}`}>{getDayLabel(day)[0]}</label>
            </Tooltip>
          ))}
        </div>
      </FormGroup>

      <FormGroup
        label={translate('Include weekends')}
        labelClassName="control-label col-sm-3"
        description={translate('Allow bookings to be scheduled at weekends')}
      >
        <div className="checkbox-toggle">
          <input
            type="checkbox"
            id="weekendsToggle"
            checked={weekends}
            onChange={() => setWeekends(!weekends)}
          />
          <label htmlFor="weekendsToggle">Toggle weekends</label>
        </div>
      </FormGroup>

      <FormGroup
        label={translate('Time slot')}
        labelClassName="control-label col-sm-3"
        valueClassName={'col-sm-8'}
        description={translate('Minimum booking time slot duration.')}
      >
        <Select
          name="timeSlotSelect"
          simpleValue={true}
          searchable={false}
          clearable={false}
          multi={false}
          options={getDurationOptions(timeMinutes)}
          value={slotDuration}
          onChange={setSlotDuration}
        />
      </FormGroup>

      <FormGroup
        label={translate('Time zone')}
        labelClassName="control-label col-sm-3"
        valueClassName={'col-sm-8'}
      >
        <Select
          name="timeZone"
          simpleValue={true}
          searchable={true}
          clearable={false}
          options={timeZoneArray}
          value={timeZone}
          onChange={setTimeZone}
        />
      </FormGroup>
    </>
  );
};
