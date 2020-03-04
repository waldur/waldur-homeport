import * as moment from 'moment-timezone';
import * as React from 'react';
import {useDispatch} from 'react-redux';
import Select from 'react-select';

import {setSettings} from '@waldur/booking/store/actions';
import {Tooltip} from '@waldur/core/Tooltip';
import {getOptions, getDurationOptions} from '@waldur/form-react/TimeSelectField';
import {translate} from '@waldur/i18n';
import {FormGroup} from '@waldur/marketplace/offerings/FormGroup';

const timeZoneArray = moment.tz.names().map(zone => ({value: zone, label: zone}));
const daysArray = [1, 2, 3, 4, 5, 6, 0];
const timeMinutes = [ 30, 60, 120, 180, 240, 300, 360, 420, 480, 1440 ];

const getDayLabel = (day: number): string => moment.weekdays(day);

const handleWeekDays = (arr, e): number[] => {
  const intVal = parseInt(e.target.value, null);
  if (arr.includes(intVal)) {
    return (arr.filter(item => item !== intVal));
  } else {
    return (arr.concat(intVal));
  }
};

export const CalendarSettings: React.FC = () => {
  const [weekends, setWeekends] = React.useState<boolean>(true);
  const [daysOfWeek, setDaysOfWeek] = React.useState<number[]>(daysArray);
  const [slotDuration, setSlotDuration] = React.useState<any>('00:30');
  const [startTime, setStartTime] = React.useState<any>(moment().startOf('day').format('HH:mm'));
  const [endTime, setEndTime] = React.useState<any>(moment().endOf('day').format('HH:mm'));
  const [timeZone, setTimeZone] = React.useState<any>(moment.tz.guess());
  const dispatch = useDispatch();

  React.useLayoutEffect(
    () => {
      const config = {
        weekends,
        slotDuration,
        businessHours: { daysOfWeek, startTime, endTime },
      };
      dispatch(setSettings(config));
    },
    [weekends, startTime, endTime, daysOfWeek, slotDuration, timeZone]
  );

  return (
    <>
      <FormGroup
        label={translate('Business hours')}
        labelClassName="control-label col-sm-3"
        valueClassName="col-sm-8"
        description={translate('Daily available booking time range')}>
        <label className="col-xs-2 control-label" htmlFor="react-select-startTime--value" >
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
        <label className="col-xs-2 control-label" htmlFor="react-select-endTime--value" >
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
        valueClassName={'col-sm-8'}>
        <div className="weekDays-selector" style={{margin: '8px 20px 0', display: 'flex', justifyContent: 'space-between'}}>
          {daysArray.map(day => (
            <Tooltip label={getDayLabel(day)} id={`weekday-${day}`}>
              <input
                type="checkbox"
                id={`weekday-${day}`}
                className="weekday"
                value={day}
                checked={daysOfWeek.includes(day)}
                onChange={e => setDaysOfWeek(handleWeekDays(daysOfWeek, e))}/>
              <label htmlFor={`weekday-${day}`}>{getDayLabel(day)[0]}</label>
            </Tooltip>
          ))}
        </div>
      </FormGroup>

      <FormGroup
        label={translate('Include weekends')}
        labelClassName="control-label col-sm-3"
        description={translate('Allow bookings to be scheduled at weekends')}>
        <div className="checkbox-toggle" style={{justifyContent: 'center'}}>
          <input type="checkbox" id="weekendsToggle" checked={weekends} onChange={() => setWeekends(!weekends)}/>
          <label htmlFor="weekendsToggle">Toggle weekends</label>
        </div>
      </FormGroup>

      <FormGroup
        label={translate('Time slot')}
        labelClassName="control-label col-sm-3"
        valueClassName={'col-sm-8'}
        description={translate('Minimum booking time slot duration.')}>
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
        valueClassName={'col-sm-8'}>
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
