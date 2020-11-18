import * as moment from 'moment-timezone';
import * as React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';

import { Tooltip } from '@waldur/core/Tooltip';
import { getOptions } from '@waldur/form/TimeSelectField';
import { reactSelectMenuPortaling } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';
import { getLocale } from '@waldur/i18n/translate';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { handleWeekDays, getDurationOptions } from '../utils';

import { useCalendarSettings } from './hooks/useCalendarSettings';

const timeZoneArray = moment.tz
  .names()
  .map((zone) => ({ value: zone, label: zone }));
const daysArray = [1, 2, 3, 4, 5, 6, 0];
const getDayLabel = (day: number): string => moment.weekdays(day);

const usePreviousWeekendsValue = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

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

  const locale = useSelector(getLocale);

  const durationOptions = React.useMemo(
    () => getDurationOptions(locale.locale),
    [locale],
  );

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
          isSearchable={false}
          isClearable={false}
          isMulti={false}
          options={getOptions(60)}
          value={getOptions(60).filter(({ value }) => value === startTime)}
          onChange={(newValue: any) => setStartTime(newValue.value)}
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
          isSearchable={false}
          isClearable={false}
          isMulti={false}
          options={[...getOptions(60), { value: '24:00', label: '24:00' }]}
          value={[...getOptions(60), { value: '24:00', label: '24:00' }].filter(
            ({ value }) => value === endTime,
          )}
          onChange={(newValue: any) => newValue.value === setEndTime}
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
                value={day}
                checked={daysOfWeek.includes(day)}
                onChange={(e) =>
                  setDaysOfWeek(handleWeekDays(daysOfWeek, e.target.value))
                }
              />
              <label htmlFor={`weekday-${day}`}>
                {getDayLabel(day)[0].toUpperCase()}
              </label>
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
          isSearchable={false}
          isClearable={false}
          isMulti={false}
          options={durationOptions}
          value={durationOptions.filter(({ value }) => value === slotDuration)}
          onChange={(newValue: any) => setSlotDuration(newValue.value)}
          {...reactSelectMenuPortaling()}
        />
      </FormGroup>

      <FormGroup
        label={translate('Time zone')}
        labelClassName="control-label col-sm-3"
        valueClassName={'col-sm-8'}
      >
        <Select
          name="timeZone"
          isSearchable={true}
          isClearable={false}
          options={timeZoneArray}
          value={timeZoneArray.filter(({ value }) => value === timeZone)}
          onChange={(newValue: any) => setTimeZone(newValue.value)}
        />
      </FormGroup>
    </>
  );
};
