import * as moment from 'moment-timezone';
import * as React from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';

import { Tooltip } from '@waldur/core/Tooltip';
import { getOptions } from '@waldur/form/TimeSelectField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { handleWeekDays, getDurationOptions, getLocale } from '../utils';

import { useCalendarSettings } from './hooks/useCalendarSettings';

const timeZoneArray = moment.tz
  .names()
  .map((zone) => ({ value: zone, label: zone }));
const daysArray = [1, 2, 3, 4, 5, 6, 0];
const getDayLabel = (day: number, lang): string =>
  moment.locale(lang) && moment.weekdays(day);

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

  const lang = useSelector(getLocale);

  React.useEffect(() => {
    if (weekends) {
      if (!daysOfWeek.includes(0 || 6)) {
        setDaysOfWeek(daysOfWeek.concat([6, 0]));
      }
    } else {
      if (daysOfWeek.includes(0 || 6)) {
        setDaysOfWeek(daysOfWeek.filter((day) => !(day === 0 || day === 6)));
      }
    }
  }, [weekends, daysOfWeek]);

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
          options={getOptions(60)}
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
          options={[...getOptions(60), { value: '24:00', label: '24:00' }]}
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
            <Tooltip
              key={index}
              label={getDayLabel(day, lang)}
              id={`weekday-${day}`}
            >
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
                {getDayLabel(day, lang)[0].toUpperCase()}
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
          simpleValue={true}
          searchable={false}
          clearable={false}
          multi={false}
          options={getDurationOptions(lang)}
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
